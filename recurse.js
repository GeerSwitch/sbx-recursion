/*****************************
 * NPM Packages
 ****************************/
// File-system operations, i.e. reading directories, checking type of files
const fs = require('fs');

// Path functions like joining and getting parts of the path
const path = require('path');

// Allow us to log pretty colors.
const chalk = require('chalk');

/*****************************
 * Program variables
 ****************************/
// Top level starting point, fill this in!
const START_DIRECTORY = '';

// Maximum number of entries we should limit to
const MAX_COUNT = 1000;

// Array of all files once the script is done running
const allFiles = [];

// Array of all empty directories
const emptyDirectories = [];


/*****************************
 * Telemetry, just for fun.
 ****************************/
// Number of subdirectories
let numSubDirectories = 0;

// The current count of entries, not to exceed MAX_COUNT
let currentCount = 0;

/*****************************
 * Function definition
 ****************************/
/**
 * @param {any} startPoint Starting directory.
 * @returns {Array<string>} Array of all the files in the directory and subdirectories.
 */
function walk(startPoint) {
  if (!startPoint.length) {
    console.log(chalk.red('You must set the START_DIRECTORY variable first.'));
    return;
  }

  // Read the files in the startPoint directory.
  const startFiles = fs.readdirSync(startPoint);

  if (!startFiles.length) {
    console.log(chalk.grey(`  -- No files in ${startPoint} --`));
    emptyDirectories.push(startPoint);
    return;
  }

  // Get the full path of each individual file.
  startFiles
    .map(file => {
      // example arguments: /Users/user/Documents, someFile.png
      // returns /Users/user/Documents/someFile.png
      return path.join(startPoint, file);
    })
    // Loop through them...
    .forEach(fullPath => {

      /*
       * You can't actually "break" out of a .forEach loop, so instead of going
       * through more than the MAX_COUNT amount of entries,
       * throw an exception to force a short-circuit.
       */
      if (currentCount >= MAX_COUNT) {
        throw new RangeError();
      }

      // Check if the passed in path is a directory
      const isDir = fs.statSync(fullPath).isDirectory();

      // If it is, log out some info and call walk() with the new-found directory.
      if (isDir == true) {
        console.log(chalk.green('+ Found directory:', fullPath));

        // Increase our tracker counters.
        numSubDirectories++;
        currentCount++;

        // Call ourself with the child directory path.
        walk(fullPath);
      } else {
        // Otherwise, just log out the filename we found.
        console.log(chalk.yellow('  - Found file:', fullPath));

        // Append to the file to our array
        allFiles.push(fullPath);
      }
    });

  // Once the loop has terminated, return the array.
  return allFiles;
}

/*****************************
 * Execution
 ****************************/
/*
 * walk() might throw an exception if we exceed more than MAX_COUNT directories,
 * so we have to wrap the execution in a try/catch block to prevent the error
 * from going unhandled and showing the stack-trace in the console.
 */
try {
  let result = walk(START_DIRECTORY);

  // Output some stats
  console.log(
    chalk.cyan(
      `There are ${result.length} files and ${numSubDirectories} subdirectories in ${START_DIRECTORY}.`
    )
  );

  // Grab all the extensions from the result array
  const extensions = result.map(file => path.extname(file));
  
  // Create a new set, which only allows unique values.
  const extSet = new Set(extensions);
  console.log(
    chalk.blue(
      `${extSet.size} filetypes:`,
      [...extSet].filter(Boolean).join(', ')
    )
  );
  console.log(
    chalk.grey(
      `${emptyDirectories.length} empty directories:\n`,
      emptyDirectories.join('\n ')
    )
  );
} catch (e) {
  if(e instanceof RangeError) {
    // If the RangeError is thrown, this block will be executed.
    console.log(chalk.red(`Max depth of ${MAX_COUNT} exceeded. Find a smaller start point.`));
  } else {
    // Unexpected error occurred.
    // Re-throw it so we can see what it is.
    throw e;
  }
}
