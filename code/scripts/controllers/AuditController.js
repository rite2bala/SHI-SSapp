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
        // text area for log
        log: {
            label: "Log",
            name: "log",
            required: true,
            placeholder: 'Click "Load Log"',
            value: ""
        },
        dsulog: ""
    }
    /**
     * Controller for Audit page (log page)
     */
export default class AuditController extends ContainerController {
    /**
     * Constructor of AuditController
     * @param {object} element default object
     * @param {object} history default object
     */
    constructor(element, history) {
        super(element, history);
        this.model = this.setModel(JSON.parse(JSON.stringify(model))); // sets model
        this.model.courier = DSUManager.getCourier(); // sets courier
        this.model.user = DSUManager.getUser(); // sets user
        this.on("closeModal", () => this.model.modal.opened = false); // closes modal prompt window
        // loads log of DSU
        this.on("loadLog", async() => {
            this.model.dsulog = await loadLog();
            showModal(this.model);
        });

        this.on("editKit", (event) => {
            const id = event.target.getAttribute("id");
            this.History.navigateToPageByTag("editkit", { id: id });
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
 * Return log of DSU
 * @returns log as string
 */
async function loadLog() {
    let dsulog = await DSUManager.getLog();
    return dsulog;
}