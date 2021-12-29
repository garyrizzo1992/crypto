
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def hello_world():
    title="Our website"
    return render_template('test.html', title=title)

@app.route('/data')
def data():
    return 'test'