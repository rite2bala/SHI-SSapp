import DSU_SSI from "./../../DSU_SSI.js"; // File with SSI of the DSU

let dsu = ""; // DSU instance for storing kit data
let user = ""; // signed in user
let courier = ""; // courier company of the user
let couriers = ["DHL", "UPS"]; // couriers that can sign in
let userLoggedIn = false;
let modaltitle = ""; // title of prompt window
let modalmessage = ""; // message of prompt window



const opendsu = require("opendsu"); // openDSU module
const resolver = opendsu.loadApi("resolver"); // resolver module


/**
 * Loads DSU instance when application is started
 */
function loadDSU() {
    try {
        resolver.loadDSU(DSU_SSI.getSSI(), (err, dsuInstance) => {
            if (err) {
                console.error(err);
                setModal("Error", "DSU has NOT been loaded, check console");
            }
            dsu = dsuInstance;
            console.log("DSU loaded", dsu);
            setModal("", "");
        })
    } catch (err) {
        console.error(err);
        setModal("Error", "DSU has NOT been loaded, check console");
    }
}
/**
 * Stores user and courier info on the DSU
 * @param {string} courierParameter name of courier
 * @param {string} userParameter name of user
 */
async function setUser(courierParameter, userParameter) {
    couriers.forEach(async(storedCourier) => {
        // if courier can sign in
        if (storedCourier == courierParameter) {
            await new Promise(async(resolve, reject) => {
                try {
                    let loginArray = [courierParameter, userParameter];
                    // stores data in DSU in file "/userdetails"
                    await dsu.writeFile("/userdetails", loginArray.toString(), (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            // sets variables for other functions of this script
                            courier = loginArray[0];
                            user = loginArray[1];
                            resolve(loginArray + " saved as login.");
                        }
                    });
                } catch (err) {
                    reject(err);
                }
            }).then((message) => {
                console.log("Success", message);
                userLoggedIn = true;
                setModal("", "");
            }).catch((err) => {
                setModal("Error", "Failed to store User in DSU, check console");
                console.error(err);
            });
        } else {
            setModal("Error", "Courier does not exist");
        }
    });




}
/**
 * Returns name of user
 * @returns name of user
 */
function getUser() {
    return user;
}
/**
 * Returns name of courier
 * @returns name of courier
 */
function getCourier() {
    return courier;
}
/**
 * Logs user out of application
 */
function logOut() {
    user = "";
    courier = "";
    userLoggedIn = false;
}
/**
 * Return boolean if user is logged in
 * @returns if user is logged in
 */
function isUserLoggedIn() {
    return userLoggedIn;
}
/**
 * Validates kit and stores kit on DSU
 * @param {object} kit 
 */
async function createKit(kit) {
    // Kit-ID: numbers, min. 3, max. 10, Regex: ^[0-9]{3,10}$
    if (!kit.kitid.match("^[0-9]{3,10}$")) {
        setModal("Invalid Input", 'Field "Kit-ID only" accepts numbers, length must be from 3 to 10');
    }
    // Product Name: numbers, letters and space, min. 5, max. 32, Regex: ^[A-Za-z0-9 ]{5,32}$
    else if (!kit.productname.match("^[A-Za-z0-9 ]{5,32}$")) {
        setModal("Invalid Input", 'Field "Product Name" only accepts numbers and letters, length must be from 5 to 32');
    } else if (kit.status == undefined || kit.status == "3") {
        setModal("Invalid Input", "Select a valid Status");
    } else if (kit.courier == undefined) {
        setModal("Invalid Input", "Select a Courier");
    }
    // Description: numbers, letters and special characters ( .,/-), min. 0, max. 255, Regex: ^[A-Za-z0-9\n .,/-]{0,255}$
    else if (!kit.description.match("^[A-Za-z0-9\n .,/-]{0,255}$")) {
        setModal("Invalid Input", 'Field "Description" only accepts numbers, letters and special characters ( .,/-), length must be from 0 to 255');
    } else {
        await new Promise((resolve, reject) => {
            try {
                // gets list of all files on DSU
                dsu.listFiles("/", (err, files) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(files);
                    }
                });
            } catch (err) {
                reject(err);
            }

        }).then((files) => {

            if (kit.id.toString() == "") {
                kit.id = (files.length - 2) // asigns kit-id based on number of files stored
            }
        }).catch((err) => {
            setModal("Error", "Failed to load files in DSU, check console");
            console.error(err);
        });
        await new Promise((resolve, reject) => {
            try {
                // stores file data on DSU
                dsu.writeFile("/kit" + kit.id, JSON.stringify(kit), (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        // logs creation
                        dsu.dsuLog("------------------------------------", (err) => { if (err) reject(err); });
                        dsu.dsuLog("ID: " + kit.id, (err) => { if (err) reject(err); });
                        dsu.dsuLog("Kit-ID:" + kit.kitid, (err) => { if (err) reject(err); });
                        dsu.dsuLog("Product Name: " + kit.productname, (err) => { if (err) reject(err); });
                        dsu.dsuLog("Creation Date: " + kit.creationdate, (err) => { if (err) reject(err); });
                        resolve("Kit " + kit.kitid + " was created.");
                    }
                });
            } catch (err) {
                reject(err);
            }
        }).then((message) => {
            setModal("Success", message);
            kit.id = "";

        }).catch((err) => {
            setModal("Error", "Kit was not created, check console");
            console.log(err);
        });

    }
}
/**
 * Returns all kits on DSU
 * @returns all kits on DSU as array
 */
async function getKits() {
    let kits = [];
    new Promise(async(resolve, reject) => {
        try {
            // lists all files on DSU
            await dsu.listFiles("/", async(err, files) => {
                if (err) {
                    reject(err);
                } else {
                    await files.forEach(async(kit) => {
                        // log file and user file not included
                        if (kit != "dsu-metadata-log" && kit != "userdetails") {
                            // reads kit files
                            await dsu.readFile("/" + kit, (err, buffer) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    let kitObject = JSON.parse(buffer.toString());
                                    kits.push(kitObject); // stores each kit in array
                                }

                            });
                            resolve("Kits loaded successfully");
                        }
                    });
                }
            });
        } catch (err) {
            reject(err);
        }
    }).then((message) => {
        console.log(message);
        setModal("", "");
    }).catch((err) => {
        setModal("Error", "Could not load Kits from DSU, check console");
        console.error(err);
    });
    return kits;
}

/**
 * Gets kits assigned to current courier
 * @returns kits as objects in array
 */
async function getCourierKits() {
    let courierKits = [];
    new Promise(async(resolve, reject) => {
        try {
            // loads all files from DSU
            await dsu.listFiles("/", async(err, files) => {
                if (err) {
                    reject(err);
                } else {
                    await files.forEach(async(kit) => {
                        // log file and user file not included
                        if (kit != "dsu-metadata-log" && kit != "userdetails") {
                            // reads kit file
                            await dsu.readFile("/" + kit, (err, buffer) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    let kitObject = JSON.parse(buffer.toString());
                                    // if courier matches
                                    if (kitObject.courier == courier) {
                                        courierKits.push(kitObject); // stores kit in array
                                    }
                                }
                            });
                            resolve("Courier Kits loaded");
                        }

                    });
                }

            });
        } catch (err) {
            reject(err);
        }
    }).then((message) => {
        console.log(message);
        setModal("", "");

    }).catch((err) => {
        setModal("Error", "Could not load Kits from DSU, check Console");
        console.error(err);
    });
    return courierKits;
}

/**
 * Returns certain kit after search with ID
 * @param {String} id ID of the kit
 * @returns kit as object
 */
function getKit(id) {
    let kit = "";
    new Promise((resolve, reject) => {
        try {
            // reads kit file of DSU with ID
            dsu.readFile("/kit" + id, (err, buffer) => {
                if (err) {
                    reject(err);
                } else {
                    const dataObject = JSON.parse(buffer.toString());
                    kit = dataObject; // stores kit
                    resolve("Kit loaded");
                }
            });
        } catch (err) {
            reject(err);
        }
    }).then((message) => {
        console.log(message);
        setModal("", "");
    }).catch((err) => {
        setModal("Error", "Could not load Kit from DSU, check console");
        console.error(err);
    });
    return kit;

}
/**
 * Returns certain kit after search with Kit-ID
 * @param {string} kitid string with kit-ID
 * @param {string} role role of user who loads kit (admin/courier) 
 * @returns kit as object
 */
async function getIDByKitID(kitid, role) {
    let kits = [];
    let actualID = "";
    // admin role loads all kits
    if (role == "admin") {
        await new Promise(async(resolve, reject) => {
            kits = await getKits(); // gets all kits
            await new Promise(resolve => setTimeout(resolve, 200)); // waiting for kits to load
            kits.forEach((kit) => {
                console.log(kit);
                // if ID matches
                if (kit.kitid == kitid) {
                    actualID = kit.id;
                    resolve(actualID);
                }
            });
            if (actualID == "") {
                reject("Kit was not found");
            }
        }).then((actualID) => {
            console.log("ID found:", actualID);
            setModal("", "");
        }).catch((err) => {
            console.error(err);
            setModal("Error", "Kit not found");
        });
    }
    // courier role loads only kits assigned to courier
    else if (role == "courier") {
        await new Promise(async(resolve, reject) => {
            kits = await getCourierKits(); // gets kits assigned to courier
            await new Promise(resolve => setTimeout(resolve, 200)); // waiting for kits to load
            kits.forEach((kit) => {
                console.log(kit);
                // if ID matches
                if (kit.kitid == kitid) {
                    actualID = kit.id;
                    resolve(actualID);
                }
            });
            if (actualID == "") {
                reject("Kit was not found");
            }
        }).then((actualID) => {
            console.log("ID found:", actualID);
            setModal("", "");
        }).catch((err) => {
            console.error(err);
            setModal("Error", "Kit not found");
        });
    }
    return actualID;


}
/**
 * Returns certain kits after search by status
 * @param {string} status status value
 * @param {string} role role of the user who loads kit (admin/courier)
 * @returns kit as object
 */
async function getKitsByStatus(status, role) {
    let kits = [];
    let foundKits = [];
    // admin role loads all ktis
    if (role == "admin") {
        kits = await getKits(); // gets all kits
        await new Promise(resolve => setTimeout(resolve, 200)); // waiting for kits to load
        if (kits.length == 0) {
            setModal("Error", "No kits found with status: " + status);
        } else {
            kits.forEach((kit) => {
                // if status matches
                if (kit.status == status) {
                    foundKits.push(kit); // store kit in array
                }
            })
        }
    }
    // courier role loads only kits assigned to courier
    else if (role == "courier") {
        kits = await getCourierKits(); // gets kits assigned to courier
        await new Promise(resolve => setTimeout(resolve, 200)); // waiting for kits to load
        if (kits.length == 0) {
            setModal("Error", "No kits found with status: " + status);
        } else {
            kits.forEach((kit) => {
                // if status matches
                if (kit.status == status) {
                    foundKits.push(kit); // stores kit in array
                }
            })
        }
    }
    return foundKits;
}

/**
 * Sets title and message of the "modal" prompt window
 * @param {string} title titel of the modal prompt window
 * @param {string} message message of the modal prompt window
 */
function setModal(title, message) {
    modaltitle = title;
    modalmessage = message;
}
/**
 * Returns title and message of the "modal" prompt window
 * @returns array with title and message of the modal prompt window
 */
function getModal() {
    return [modaltitle, modalmessage];
}

/**
 * Changes status to next step of a certain kit
 * @param {string} id ID of the kit
 */
async function nextStep(id) {
    let kit = getKit(id); // gets kit by ID
    if (kit.status == 1) {
        kit.statusLabel = "In transit";
        kit.status = 2;
        logStatusChange(1, 2);
    } else if (kit.status == 2) {
        // step 3 is skipped
        kit.statusLabel = "Ready for pickup at patient";
        kit.status = 4;
        logStatusChange(2, 4);
    } else if (kit.status == 4) {
        kit.statusLabel = "Unused product in transit";
        kit.status = 5;
        logStatusChange(4, 5);
    } else if (kit.status == 5) {
        kit.statusLabel = "Done";
        kit.status = 6;
        logStatusChange(5, 6);
    }
    await createKit(kit); // stores kit with new status on DSU
    if (modaltitle == "Success") {
        setModal("Success", "Status was changed successfully");
    } else if (modaltitle == "Error") {
        setModal("Error", "Could not change Status");
    }
}

/**
 * Logs status change on DSU
 * @param {string} oldStatus previous status value
 * @param {string} newStatus new status value
 */
function logStatusChange(oldStatus, newStatus) {
    let date = Date(Date.now()); // gets time and date of change
    dsu.dsuLog("------------------------------------", (err) => { if (err) console.error(err); });
    dsu.dsuLog("Change Date: " + date.toString(), (err) => { if (err) console.error(err); });
    dsu.dsuLog(getCourier() + "/" + getUser() + ": Status changed from " + oldStatus + " to " + newStatus + ": ", (err) => { if (err) console.error(err); });
}

/**
 * Returns log of DSU as string
 * @returns log as string
 */
async function getLog() {
    let dsulog = "";
    await new Promise((resolve, reject) => {
        let log = ""
        try {
            // reads log file
            dsu.readFile('/dsu-metadata-log', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    dsulog = data.toString(); // stores data as string
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    }).then(() => {
        console.log("Log loaded successfully");
        setModal("", "");

    }).catch((err) => {
        setModal("Error", "Could not load log, check console");
        console.error(err);
    });
    return dsulog;

}
/**
 * Manages access to DSU
 */
export default {
    loadDSU,
    setUser,
    getUser,
    getCourier,
    logOut,
    isUserLoggedIn,
    createKit,
    getKits,
    getKit,
    getIDByKitID,
    getKitsByStatus,
    getCourierKits,
    setModal,
    getModal,
    nextStep,
    logStatusChange,
    getLog
}