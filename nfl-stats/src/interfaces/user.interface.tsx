import Permission from "./permission.interface";

export default interface User {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    permissions?: Permission[]|undefined;
}