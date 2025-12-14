from flask import Flask, request, send_file, jsonify
from werkzeug.utils import secure_filename
import subprocess, tempfile, os, zipfile, shutil
import imageio_ffmpeg

# ✅ FFmpeg that works on Render
FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()

app = Flask(__name__, static_url_path='', static_folder='.')

ALLOWED_EXTS = {'m4a', 'mp4', 'aac'}
MAX_FILES = 5

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/style.css')
def css():
    return send_file('style.css')

@app.route('/script.js')
def js():
    return send_file('script.js')

def allowed(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTS

def convert_ffmpeg(src, dst, bitrate):
    cmd = [
        FFMPEG_PATH,
        "-y",
        "-i", src,
        "-vn",
        "-map_metadata", "-1",
        "-acodec", "libmp3lame",
        "-ab", f"{bitrate}k",
        dst
    ]
    process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print(process.stderr.decode())
    return process.returncode == 0 and os.path.exists(dst)

@app.route('/convert', methods=['POST'])
def convert():
    files = request.files.getlist('files')
    bitrate = request.form.get('bitrate', '192')

    if not files or files[0].filename == "":
        return jsonify({"error": "No files selected"}), 400

    if len(files) > MAX_FILES:
        return jsonify({"error": "Maximum 5 files allowed"}), 400

    temp_dir = tempfile.mkdtemp()
    output_files = []

    try:
        for file in files:
            filename = secure_filename(file.filename)
            if not allowed(filename):
                continue

            src_path = os.path.join(temp_dir, filename)
            file.save(src_path)

            mp3_path = os.path.join(
                temp_dir,
                os.path.splitext(filename)[0] + ".mp3"
            )

            if convert_ffmpeg(src_path, mp3_path, bitrate):
                output_files.append(mp3_path)

        if not output_files:
            return jsonify({"error": "Conversion failed"}), 500

        # 🔥 One file → direct download
        if len(output_files) == 1:
            return send_file(output_files[0], as_attachment=True)

        # 🔥 Multiple files → ZIP
        zip_path = os.path.join(temp_dir, "converted_mp3s.zip")
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            for f in output_files:
                zipf.write(f, os.path.basename(f))

        return send_file(zip_path, as_attachment=True)

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    app.run()
