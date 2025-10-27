import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environment/environment";
import { UserDto } from "./data/user.dto";
import { catchError } from "rxjs";
import { ErrorService } from "../../core/services/error.service";
import { UserUpdateDto } from "./data/user-update.dto";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private errorService = inject(ErrorService);
    private base = environment.apiUrl;

    updateUser(userData: UserUpdateDto, image?: File | null) {
        const url = `${this.base}/user`;
        const request$ = image
            ? this.http.patch<UserDto>(url, this.toFormData(userData, image))
            : this.http.patch<UserDto>(url, userData);
        return request$.pipe(
            catchError((err) => this.errorService.handleHttpError(err))
        );
    }

    private toFormData(dto: UserUpdateDto, image: File): FormData {
        const fd = new FormData();
        Object.entries(dto).forEach(([k, v]) => {
            if (v !== undefined && v !== null) fd.append(k, String(v));
        });
        fd.append('file', image);
        return fd;
    }
}