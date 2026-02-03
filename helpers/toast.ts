import { Bounce, toast } from "react-toastify";

export const SucessToast = (msg: string = "Succesfull") => {
  toast.success(msg, {
    position: "top-right",
    autoClose: 6000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
  });
};
