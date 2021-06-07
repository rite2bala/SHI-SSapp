import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js"; // main controller
import DSUManager from "./DSUManager.js"; // DSU manager

const model = {
        // scanner values
        isScannerActive: false,
        scanData: "",
        buttonLabel: "Activate Scanner",
        // values of "modal" prompt window
        modal: {
            opened: false,
            title: "",
            message: ""
        }
    }
    /**
     * Controler for Scan page
     */
export default class ScanController extends ContainerController {
    /**
     * Constructor of ScanController
     * @param {object} element default object 
     * @param {object} history default object
     */
    constructor(element, history) {
        super(element, history);
        this.model = this.setModel(JSON.parse(JSON.stringify(model))); // sets model
        this.model.user = DSUManager.getUser(); // sets user
        this.model.courier = DSUManager.getCourier(); // sets courier
        this.on("closeModal", () => this.model.modal.opened = false); // closes modal prompt window
        // toggles if scanner is active
        this.on("toggleScanner", () => {
            this.model.isScannerActive = !this.model.isScannerActive;
            if (this.model.isScannerActive) {
                this.model.buttonLabel = "Deactivate Scanner"
            } else {
                this.model.buttonLabel = "Activate Scanner"
            }
            this.model.scanData = '';
        });
        // links to kit details page
        this.on("showKitDetails", async() => {
            let actualID = "";
            actualID = await DSUManager.getIDByKitID(this.model.scanData, "courier");
            await new Promise(resolve => setTimeout(resolve, 200));
            if (actualID.toString() != "") {
                this.History.navigateToPageByTag("kitdetails", { id: actualID }); // gives ID of Kit to kit details page
            } else {
                showModal(this.model);
            }
        });
    }
}

/**
 * Show prompt in case of error or success
 * @param {object} model model of the controller
 * @returns model of the controller
 */
async function showModal(model) {
    await new Promise(resolve => setTimeout(resolve, 400)); // waiting in case DSU is still loading
    let modal = DSUManager.getModal();
    model.modal.title = modal[0];
    model.modal.message = modal[1];
    // if prompt has value
    if (model.modal.title != "" && model.modal.message != "") {
        model.modal.opened = true;
    }
    return model;
}