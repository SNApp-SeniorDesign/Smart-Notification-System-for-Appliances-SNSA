const TOKEN_KEY = "access_token"

export function getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string, persist: boolean): void {
    if (typeof window === "undefined") return
    if (persist){
        localStorage.setItem(TOKEN_KEY, token)
        sessionStorage.removeItem(TOKEN_KEY)
    } else {
        sessionStorage.setItem(TOKEN_KEY, token)
        localStorage.removeItem(TOKEN_KEY)
    }
}

export function clearToken(): void{
    if (typeof window === "undefined") return
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
}

