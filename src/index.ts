import { TaskEither, taskify, taskEither } from "fp-ts/lib/TaskEither";
import { array } from "fp-ts/lib/Array";
import { traverse } from "fp-ts/lib/Traversable";
import { exec } from "child_process";
import * as sizeOf from "image-size";
import * as fs from "fs";

const dir = `/Users/simonepicciani/Dropbox (Personal)/IFTTT/reddit/wallpapers`;

// export interface ExecResult {
//   stdout: Buffer | string;
//   stderr: Buffer | string;
// }
// const execTask = taskify(
//   (
//     command: string,
//     cb: (e: Error | null | undefined, r?: ExecResult) => void,
//   ) => {
//     exec(command, (err, stdout, stderr) => cb(err, { stdout, stderr }));
//   },
// );

// function execTE(command: string): TaskEither<Error, string> {
//   return execTask(command).map(({ stdout }) => {
//     let res;
//     if (Buffer.isBuffer(stdout)) {
//       res = stdout.toString("utf8");
//     } else {
//       res = stdout;
//     }
//     return res;
//   });
// }

const readDir: (
  path: fs.PathLike,
  options: { withFileTypes: true },
) => TaskEither<NodeJS.ErrnoException, fs.Dirent[]> = taskify(fs.readdir);

const getDimensions = taskify(sizeOf);

const filterOnlyFiles: (a: fs.Dirent[]) => fs.Dirent[] = files =>
  files.filter(file => file.isFile());

const traverseTEA = traverse(taskEither, array);

function main(): void {
  readDir(dir, { withFileTypes: true })
    .map(filterOnlyFiles)
    .map(files => files.map(file => `${dir}/${file.name}`))
    .chain(paths => traverseTEA(paths, singleFile => getDimensions(singleFile)))

    .fold(
      err => console.error("ERROR!!", JSON.stringify(err)),
      res => console.log(`res is: `, res),
    )
    .run();
}

main();

// fs.readdir(dir, { withFileTypes: true }, (err, files) => {
//   if (err) {
//     console.log("fail#readdir", JSON.stringify(err));
//     return;
//   }
//   console.log(`found #${files.length} elements`);

//   files
//     .filter(file => file.isFile())
//     .forEach(file => {
//       sizeOf(`${dir}/${file.name}`, function(err, dimensions) {
//         if (err) {
//           console.log("fail#sizeOf", JSON.stringify(err));
//           return;
//         }
//         if (dimensions.width < 1599) {
//           console.log(
//             `small image found -> [${file.name}] width: [${dimensions.width}]`,
//           );
//         }
//       });
//     });
// });
