import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js"; // main controller
import DSUManager from "./DSUManager.js"; // DSU manager

const model = {
    // user info
    user: "",
    courier: "",
    id: {
        value: ""
    },
    // kit-ID text input
    kitid: {
        label: "Kit-ID *",
        name: "kitid",
        required: true,
        placeholder: "Kit-ID here...",
        value: ""
    },
    // product name text input
    productname: {
        label: "Product Name *",
        name: "product Name",
        required: true,
        placeholder: "Prodcut Name here...",
        value: ""
    },
    // status dropdown
    statusSelect: {
        label: "Status *",
        placeholder: "Please select one option...",
        required: true,
        options: [{
            label: "Ready for pickup at Clinical Resource",
            value: "1"
        }, {
            label: "In transit",
            value: "2"
        }, {
            label: "(not used) Delivered to patient",
            // not in use
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
        label: "Courier *",
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
    // values of "modal" prompt window
    modal: {
        opened: false,
        title: "",
        message: ""
    }
}

/**
 * Controller for Create Data page (createdemokits) 
 */
export default class CreateDemoKitsController extends ContainerController {
    /**
     * Constructor of CreateDemoKitsController
     * @param {object} element default object
     * @param {object} history default object
     */
    constructor(element, history) {
        super(element, history);
        this.model = this.setModel(JSON.parse(JSON.stringify(model))); // sets model
        this.model.courier = DSUManager.getCourier(); // sets courier
        this.model.user = DSUManager.getUser(); // sets user
        // kit with input data is created
        this.on("createKit", async() => {
            this.model.kit.kitid = this.model.kitid.value;
            this.model.kit.productname = this.model.productname.value;
            this.model.kit.status = this.model.statusSelect.value;
            if (this.model.statusSelect.value) {
                this.model.kit.statusLabel = this.model.statusSelect.options[this.model.statusSelect.value - 1].label; // stores status label
            }
            this.model.kit.courier = this.model.courierSelect.value;
            this.model.kit.description = this.model.description.value;

            let date = Date(Date.now()); // gets creation date
            this.model.kit.creationdate = date.toString();

            await DSUManager.createKit(this.model.kit);
            showModal(this.model);

        });
        this.on("closeModal", () => this.model.modal.opened = false); // closes modal prompt window
        this.on("showList", () => this.History.navigateToPageByTag("adminlist")); // link to admin list page
        this.on("clearFields", () => clear(this.model));
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
 * Clears all input fields
 * @param {object} model model of the controller 
 */
function clear(model) {
    model.id.value = "";
    model.kitid.value = "";
    model.productname.value = "";
    model.statusSelect.value = "";
    model.courierSelect.value = "";
    model.description.value = "";
    model.kitid.value = "";
    return model;
}