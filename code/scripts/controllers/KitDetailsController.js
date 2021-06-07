import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js"; // main controller
import DSUManager from "./DSUManager.js"; // DSU manager

const model = {
    // user info
    user: "",
    courier: "",
    // values of "modal" prompt window
    modal: {
        opened: false,
        title: "",
        message: ""
    },
    // kit-ID text input
    kitid: {
        label: "Kit-ID",
        name: "kitid",
        required: true,
        placeholder: "Kit-ID here...",
        value: ""
    },
    // product name text input
    productname: {
        label: "Product Name",
        name: "product Name",
        required: true,
        placeholder: "Prodcut Name here...",
        value: ""
    },
    // status dropdown
    statusSelect: {
        label: "Status",
        placeholder: "Please select one option...",
        required: true,
        options: [{
            label: "Ready for pickup at Clinical Resource",
            value: "1"
        }, {
            label: "In transit",
            value: "2"
        }, {
            label: "Delivered to patient",
            value: "3"
        }, {
            label: "Ready for pickup at patient",
            value: "4"
        }, {
            label: "Unused product in transit",
            value: "5"
        }, {
            label: "Done",
            value: "6"
        }]
    },
    // courier dropdown
    courierSelect: {
        label: "Courier",
        placeholder: "Please select one option...",
        required: true,
        options: [{
            label: "DHL",
            value: "DHL"
        }, {
            label: "UPS",
            value: "UPS"
        }]
    },
    // description text area
    description: {
        label: "Description",
        name: "description",
        required: true,
        placeholder: "Description here...",
        value: ""
    },
    // creation date text field
    creationdate: {
        label: "Creation Date",
        name: "creationdate"
    },
    kit: {
        id: "",
        kitid: "",
        productname: "",
        status: "",
        statusLabel: "",
        courier: "",
        description: "",
        creationdate: ""
    },
    nextStep: "", // text for nextStep button
    buttonDisabled: false,
    // datamatrix values
    isDatamatrixShown: false,
    datamatrixLabel: "Show Datamatrix"
}

/**
 * Controller for Kit Details page
 */
export default class KitDetailsController extends ContainerController {
    /**
     * Constructor of KitDetailsController
     * @param {object} element default object
     * @param {object} history default object
     */
    constructor(element, history) {
        super(element, history);
        this.model = this.setModel(JSON.parse(JSON.stringify(model))); // sets model
        this.model.user = DSUManager.getUser(); // sets user
        this.model.courier = DSUManager.getCourier(); // sets courier
        let state = this.History.getState(); // loads ID of kit from previous page
        this.id = typeof state !== "undefined" ? state.id : undefined; // loads ID of kit from previous page
        this.model.kit = getKit(this.id);
        getNextStep(this.model, this.model.kit.status);
        this.on("closeModal", () => this.History.navigateToPageByTag("courierlist")); // closes modal, link to courier list page
        this.on("nextStep", async() => {
            await DSUManager.nextStep(this.model.kit.id);
            showModal(this.model);
        });
        // shows and hides datamatrix
        this.on("toggleDatamatrix", () => {
            if (this.model.isDatamatrixShown) {
                this.model.isDatamatrixShown = false;
                this.model.datamatrixLabel = "Show Datamatrix";
            } else {
                this.model.isDatamatrixShown = true;
                this.model.datamatrixLabel = "Hide Datamatrix";
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

/**
 * Returns kit after search with ID
 * @param {String} id ID of the kit
 * @returns kit as object
 */
function getKit(id) {
    let kit = "";
    kit = DSUManager.getKit(id);
    return kit;
}

/**
 * Returns next step label for button
 * @param {object} model model of the controller
 * @param {string} status status valueof the kit
 * @returns model of the controller
 */
function getNextStep(model, status) {
    if (status == 1) model.nextStep = "Picked up from Clincial Resource";
    else if (status == 2) model.nextStep = "Deliver to Patient";
    else if (status == 4) model.nextStep = "Picked up from Patient";
    else if (status == 5) model.nextStep = "Unused Product destroyed";
    else if (status == 6) {
        // button gets disabled as last step is done
        model.nextStep = "Product already destroyed";
        model.buttonDisabled = true;
    }
    return model;
}