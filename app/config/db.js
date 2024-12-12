const fs = require('fs').promises; // Use promises for the fs module
var File = require('../models/File');

class Database {

    // Static property to hold the singleton instance
    static #instance;
    // Other attributes
    static #folderPath;
    static #fileNames = [];
    static #files = [];

    constructor(folderPath) {
        if (Database.#instance) {
            return Database.#instance; // Return existing instance if it exists
        }

        console.log("Creating file-based Database instance...");
        Database.#folderPath = folderPath;
        Database.#files = []; // Initialize files array

        // Initialize the database and return a promise
        this.#initialize().then(() => {
            console.log("Files: ", Database.#fileNames);
        }).catch(err => {
            console.error('Error during initialization:', err);
        });

        Database.#instance = this; // Set singleton instance
    }

    async #initialize() {
        try {
            const files = await fs.readdir(Database.#folderPath); // Read directory contents
            //console.log("Data Folder: ", Database.#folderPath);
            // Initialize file_names as an empty array
            Database.#fileNames = [];

            // Use Promise.all to create File instances and push file names
            Database.#files = await Promise.all(
                files.map(file => {
                    //console.log("File Dir: ", `${Database.#folderPath}/${file}`);
                    Database.#fileNames.push(file); // Push file name to the array
                    return new File(`${Database.#folderPath}/${file}`); // Create and return a new File instance
                })
            );
        } catch (err) {
            console.error('Unable to scan directory:', err);
            throw err; // Re-throw the error to be caught in the constructor
        }
    }


    // Static method to get the instance
    static getInstance(folderPath) {
        if (!Database.#instance) {
            Database.#instance = new Database(folderPath); // Create the instance if it doesn't exist
        }
        return Database.#instance; // Return the singleton instance
    }

    /**
     * Get the Data Folder directory
     * 
     * @return {string} Data folder of this file-based database
     */
    static getDataFolderDir() {
        return Database.#folderPath;
    }

    /**
     * Get the name of file that have ID = fileId
     * 
     * @param {number} fileId
     * @return {string|null} Name of file that has ID = fileId
     */
    static getFileName(fileId) {
        if (fileId >= Database.#fileNames.length) return null;
        return Database.#fileNames[fileId];
    }

    /**
     * Get the name of all file in the Database
     * 
     * @return {Array<string>} Name of file that has ID = fileId
     */
    static getAllFileName() {
        return Database.#fileNames;
    }

    /**
     * return File object that hass ID = fileId
     * 
     * @param {number} fileId
     * @returns {File|null} File object that has ID = fileID
     */
    static getFile(fileId) {
        if (fileId >= Database.#files.length) return null;
        return Database.#files[fileId];
    }

}

// Export
module.exports = Database;