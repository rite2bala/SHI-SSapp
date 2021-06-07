import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js"; // main controller
import DSUManager from "./DSUManager.js"; // DSU manager

const model = {
    // couriername text input
    couriername: {
        label: "Courier Name *",
        name: "couriername",
        required: true,
        placeholder: "Courier name here...",
        value: ""
    },
    // username text input
    username: {
        label: "Username",
        name: "username",
        required: true,
        placeholder: "Username here...",
        value: ""
    },
    // password text input (is disabled)
    password: {
        label: "Password",
        name: "password",
        required: true,
        placeholder: "Password here...",
        value: "12345678"
    },
    // values of "modal" prompt window
    modal: {
        opened: false,
        title: "",
        message: ""
    }
}

/**
 * Controller for Login page
 */
export default class LoginController extends ContainerController {
    /**
     * 
     * @param {object} element default object
     * @param {object} history default object
     */
    constructor(element, history) {
        super(element, history);
        this.model = this.setModel(JSON.parse(JSON.stringify(model))); // sets model
        DSUManager.logOut();
        DSUManager.loadDSU();
        showModal(this.model);
        this.on("closeModal", () => this.model.modal.opened = false); // closes modal prompt window
        this.on("loginSubmit", async() => {
            await DSUManager.setUser(this.model.couriername.value, this.model.username.value);
            await new Promise(resolve => setTimeout(resolve, 500)); // waiting for login process to finish
            if (DSUManager.isUserLoggedIn() == true) {
                this.History.navigateToPageByTag("courierlist"); // link to courier list page
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