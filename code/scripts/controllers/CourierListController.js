import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js"; // main controller
import DSUManager from "./DSUManager.js"; // DSU manager

const model = {
    // user infos
    user: "",
    courier: "",
    // values of "modal" prompt window
    modal: {
        opened: false,
        title: "",
        message: ""
    },
    // status dropdown
    searchStatus: {
        label: "Search by Status",
        placeholder: "Please select one option...",
        required: true,
        options: [{
            label: "Ready for pickup at Clinical Resource",
            value: "1"
        }, {
            label: "In transit",
            value: "2"
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
    // ID input field
    searchID: {
        label: "Search by Kit-ID",
        name: "searchID",
        required: true,
        placeholder: "Kit-ID here...",
        value: ""
    }
}

/**
 * Controller for Courier List page
 */
export default class CourierListController extends ContainerController {
    /**
     * Constructor of CourierListController
     * @param {object} element default object
     * @param {object} history default object
     */
    constructor(element, history) {
        super(element, history);
        this.model = this.setModel(JSON.parse(JSON.stringify(model))); // sets model
        this.model.courier = DSUManager.getCourier(); // set courier
        this.model.user = DSUManager.getUser(); // set user
        this.on("closeModal", () => this.model.modal.opened = false); // closes modal prompt window
        // loads kits assigned to courier
        this.on("loadKits", async() => {
            this.model.kits = await getCourierKits()
            showModal(this.model);
        });
        // links to kit details page
        this.on("showDetails", (event) => {
            const id = event.target.getAttribute("id"); // sets ID of kit
            this.History.navigateToPageByTag("kitdetails", { id: id }); // sends ID of kit to kitdetails page
        });
        // searches for kits
        this.on("search", async() => {
            this.model.kits = await search(this.model.searchID.value, this.model.searchStatus.value);
            showModal(this.model);
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
 * Return all kits assigned to courier
 * @returns array with kits as objects
 */
function getCourierKits() {
    let kits = DSUManager.getCourierKits();
    console.log("admin ", kits);
    return kits;
}
/**
 * Searches kits assigned to courier by Kit-ID or Status (Kit-ID is prioritized)
 * @param {string} kitID kit-ID of kit
 * @param {string} status status value of kit
 * @returns kits in array as object
 */
async function search(kitID, status) {
    let id = "";
    let kits = [];
    id = await DSUManager.getIDByKitID(kitID, "courier");
    if (status) {
        kits = await DSUManager.getKitsByStatus(status, "courier");
    }
    if (id.toString() != "") {
        kits = []; // array reset because ID search is prioritized
        kits.push(DSUManager.getKit(id)); // stores kit in array
    }
    return kits;
}