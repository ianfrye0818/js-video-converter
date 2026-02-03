import 'dotenv/config';
import { Watcher } from './Watcher';

const WATCH_DIR = process.env.WATCH_DIR;
const OUTPUT_DIR = process.env.OUTPUT_DIR;

const watcher = new Watcher(WATCH_DIR, OUTPUT_DIR);

watcher.start();
