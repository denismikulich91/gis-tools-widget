import Vuex from "vuex";

// init store
export const store = new Vuex.Store({
    state: {
        messages: ["Hello 3DExperience Platform", "Made with Vue & Quasar"],
        messageNumber: 0
    },
    mutations: {
        swapMessage(state) {
            state.messageNumber = (state.messageNumber + 1) % state.messages.length;
        }
    },
    getters: {
        currentMessage({ messages, messageNumber }) {
            return messages[messageNumber];
        }
    }
});
