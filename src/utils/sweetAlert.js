import Swal from "sweetalert2";

export const showSuccess = (title, text = "") => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonText: "OK",
    confirmButtonColor: "#3f6b35",
  });
};

export const showError = (title, text = "") => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "OK",
    confirmButtonColor: "#3f6b35",
  });
};

export const showWarning = (title, text = "") => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonText: "OK",
    confirmButtonColor: "#3f6b35",
  });
};

export const showInfo = (title, text = "") => {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonText: "OK",
    confirmButtonColor: "#3f6b35",
  });
};

export const showConfirm = async ({ title, text = "", confirmText = "Yes", cancelText = "Cancel" }) => {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#3f6b35",
    cancelButtonColor: "#795548",
    reverseButtons: true,
  });
};
