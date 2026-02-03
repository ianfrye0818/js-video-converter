import 'dotenv/config';
import { Watcher } from './Watcher';

const WATCH_DIR = process.env.WATCH_DIR;
const OUTPUT_DIR = process.env.OUTPUT_DIR;
const FFMPEG_PATH = process.env.FFMPEG_PATH;

const watcher = new Watcher(WATCH_DIR, OUTPUT_DIR, FFMPEG_PATH);

watcher.start();
