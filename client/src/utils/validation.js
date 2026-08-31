const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;
const URL_REGEX = /^https?:\/\/.+/i;
const TEXT_ONLY_REGEX = /^[A-Za-z\s]+$/;

const isEmptyValue = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    return false;
};

export const required = (value, message = "This field is required") => {
    if (isEmptyValue(value)) return message;
    return null;
};

export const textOnly = (value, message = "Please enter only letters and spaces") => {
    if (isEmptyValue(value)) return null;
    return TEXT_ONLY_REGEX.test(String(value).trim()) ? null : message;
};

export const email = (value, message = "Please enter a valid email") => {
    if (isEmptyValue(value)) return null;
    return EMAIL_REGEX.test(String(value).trim()) ? null : message;
};

export const phone = (value, message = "Please enter a valid phone number") => {
    if (isEmptyValue(value)) return null;
    const normalizedValue = String(value).replace(/\s+/g, "");
    return PHONE_REGEX.test(normalizedValue) ? null : message;
};

export const url = (value, message = "Please enter a valid URL") => {
    if (isEmptyValue(value)) return null;
    return URL_REGEX.test(String(value).trim()) ? null : message;
};

export const positiveNumber = (value, message = "Please enter a positive number") => {
    if (isEmptyValue(value)) return null;
    const numberValue = Number(value);
    if (Number.isNaN(numberValue) || numberValue <= 0) return message;
    return null;
};

export const positiveInteger = (value, message = "Please enter a positive whole number") => {
    if (isEmptyValue(value)) return null;
    const numberValue = Number(value);
    if (!Number.isInteger(numberValue) || numberValue <= 0) return message;
    return null;
};

export const minItems = (value, min = 1, message = `Please select at least ${min} item(s)`) => {
    if (isEmptyValue(value)) return message;
    return Array.isArray(value) && value.length >= min ? null : message;
};

export const validateField = (value, validators = []) => {
    for (const validator of validators) {
        const error = validator(value);
        if (error) return error;
    }

    return null;
};

export const validateFields = (values, rules = {}) => {
    return Object.entries(rules).reduce((errors, [field, validators]) => {
        const error = validateField(values?.[field], validators);
        if (error) errors[field] = error;
        return errors;
    }, {});
};