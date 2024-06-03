import { writable } from "svelte/store";

const newLoading = () => {
  const { subscribe, update, set } = writable({
    status: "IDLE", // IDLE, LOADING
    message: "",
  });

  function setLoading(isLoading: boolean, message: string = "") {
    update(() => {
      return {
        status: isLoading ? "LOADING" : "IDLE",
        message: isLoading ? message : "",
      };
    });
  }

  function setMessage(message: string) {
    update(() => {
      return {
        status: "LOADING",
        message: message,
      };
    });
  }

  return { subscribe, update, set, setLoading, setMessage };
};

const loading = newLoading();
export default loading;
