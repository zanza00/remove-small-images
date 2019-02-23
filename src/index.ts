import { TaskEither, taskify, tryCatch } from "fp-ts/lib/TaskEither";
import { exec } from "child_process";

const findDimensions = (dir: string): string =>
  `find ${dir} -type f -exec identify -format "%f %w" \{\} \;`;

export interface ExecResult {
  stdout: Buffer | string;
  stderr: Buffer | string;
}
const execTask = taskify(
  (
    command: string,
    cb: (e: Error | null | undefined, r?: ExecResult) => void,
  ) => {
    exec(command, (err, stdout, stderr) => cb(err, { stdout, stderr }));
  },
);

function execTE(command: string): TaskEither<Error, string> {
  return execTask(command).map(({ stdout }) => {
    let res;
    if (Buffer.isBuffer(stdout)) {
      res = stdout.toString("utf8");
    } else {
      res = stdout;
    }
    return res;
  });
}

function splitAndFilter(stdout: string): string[] {
  return stdout
    .split("\n")
    .filter(
      x => x.length > 1 && x !== "1" && x !== "900.0" && !x.startsWith("~"),
    );
}

const dir = `~/Dropbox\ (Personal)/IFTTT/reddit/wallpapers`;
function main(): void {
  execTE(findDimensions(dir))
    .map(x => {
      console.log(x);
      return x;
    })
    // .map(splitAndFilter)
    // .chain(({ wallpaper }) =>
    //   execTE(openWallpaperCommand(wallpaper)).map(() => wallpaper),
    // )
    .fold(
      err => console.error("ERROR!!", JSON.stringify(err)),
      res => console.log(`Successfuly opened ${res}`),
    )
    .run();
}

main();
