from flask import Flask, request, send_file, jsonify
from werkzeug.utils import secure_filename
import subprocess, tempfile, os, zipfile, shutil

FFMPEG_PATH = "ffmpeg"   # Works on Render + Local if ffmpeg is in PATH
app = Flask(__name__, static_url_path='', static_folder='.')

ALLOWED_EXTS = {'m4a', 'mp4', 'aac'}
MAX_FILES = 5
MAX_SIZE_MB = 25

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

def ffmpeg_convert(src, dst, bitrate):
    cmd = [FFMPEG_PATH, '-y', '-i', src, '-ab', f'{bitrate}k', dst]
    return subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE).returncode == 0

@app.route('/convert', methods=['POST'])
def convert():
    files = request.files.getlist('files')
    bitrate = request.form.get('bitrate', '192')

    if not files:
        return jsonify({'error': 'No files'}), 400

    if len(files) > MAX_FILES:
        return jsonify({'error': 'Max 5 files allowed'}), 400

    temp_dir = tempfile.mkdtemp()
    output_files = []

    try:
        for f in files:
            if f.content_length > MAX_SIZE_MB * 1024 * 1024:
                return jsonify({'error': 'File too large'}), 400

            filename = secure_filename(f.filename)
            if not allowed(filename):
                continue

            src = os.path.join(temp_dir, filename)
            f.save(src)

            out_name = os.path.splitext(filename)[0] + ".mp3"
            out_path = os.path.join(temp_dir, out_name)

            if ffmpeg_convert(src, out_path, bitrate):
                output_files.append(out_path)

        if not output_files:
            return jsonify({'error': 'Conversion failed'}), 500

        if len(output_files) == 1:
            return send_file(output_files[0], as_attachment=True)

        zip_path = os.path.join(temp_dir, 'converted_mp3s.zip')
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for f in output_files:
                zipf.write(f, os.path.basename(f))

        return send_file(zip_path, as_attachment=True)

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == '__main__':
    app.run(debug=True)
