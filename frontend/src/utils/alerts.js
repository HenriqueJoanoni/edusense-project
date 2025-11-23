import Swal from 'sweetalert2';

const defaultConfig = {
    customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false,
};

export const showSuccessAlert = (title, text = '', options = {}) => {
    return Swal.fire({
        icon: 'success',
        title,
        text,
        confirmButtonText: 'OK',
        timer: 3000,
        timerProgressBar: true,
        ...defaultConfig,
        ...options
    });
};

export const showErrorAlert = (title, text = '', options = {}) => {
    return Swal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonText: 'Try Again',
        ...defaultConfig,
        ...options
    });
};

export const showConfirmAlert = (title, text = '', options = {}) => {
    return Swal.fire({
        icon: 'warning',
        title,
        text,
        showCancelButton: true,
        confirmButtonText: 'Yes, confirm',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        ...defaultConfig,
        ...options
    });
};

export const showInfoAlert = (title, text = '', options = {}) => {
    return Swal.fire({
        icon: 'info',
        title,
        text,
        confirmButtonText: 'Understood',
        ...defaultConfig,
        ...options
    });
};

export const showLoadingAlert = (title = 'Loading...') => {
    return Swal.fire({
        title,
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: 2000,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

export const closeAlert = () => {
    Swal.close();
};

export const showToast = (icon, title) => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    return Toast.fire({
        icon,
        title
    });
};

export default Swal;