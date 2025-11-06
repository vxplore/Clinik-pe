import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type Method,
} from "axios";

// type ApiResponse<T> = {
//     data: T | null;
//     status: number;
//     statusText: string;
//     headers: Record<string, string>;
// };

class ApiAgent {
    private readonly apiAgent: AxiosInstance;
    private readonly baseConfig = {
        baseURL: "https://devs.v-xplore.com/clinicpe/",
        method: "get",
        withCredentials: true,
        headers: {
            Accept: "application/json",
        },
    };
    private config: AxiosRequestConfig = { ...this.baseConfig }

    constructor(baseURL?: string) {
        this.apiAgent = axios.create();
        this.config.baseURL = baseURL || this.config.baseURL;
        this.apiAgent.interceptors.request.use(
            (config) => {
                //console.log("[Request]", config.method?.toUpperCase(), config.url);
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.apiAgent.interceptors.response.use(
            (response) => {
                //console.log("[Response]", response.status, response.config.url);
                return response;
            },
            (error) => {
                //console.error("[Error]", error);
                return Promise.reject(error);
            }
        );
    }

    path(path: string): ApiAgent {
        this.config.url = path;
        return this;
    }

    method(method: Method): ApiAgent {
        this.config.method = method;
        return this;
    }

    json(data: any): ApiAgent {
        this.config.data = data;
        this.config.headers = {
            ...this.config.headers,
            "Content-Type": "application/json",
        };
        return this;
    }

    // Attach FormData payload and ensure Content-Type is not forced so the
    // browser can set the correct multipart boundary header.
    form(data: FormData): ApiAgent {
        this.config.data = data;
        const headers = { ...(this.config.headers || {}) } as Record<string, any>;
        if (headers["Content-Type"]) delete headers["Content-Type"];
        this.config.headers = headers;
        return this;
    }

    query(params: Record<string, any>): ApiAgent {
        this.config.params = params;
        return this;
    }

    header(key: string, value: string): ApiAgent {
        this.config.headers = {
            ...this.config.headers,
            [key]: value,
        };
        return this;
    }

    cleanHeaders(headers: Record<string, any>): Record<string, string> {
        const result: Record<string, string> = {};
        for (const key in headers) {
            const value = headers[key];
            if (typeof value === "string") {
                result[key] = value;
            } else if (value != null) {
                result[key] = String(value);
            }
        }
        return result;
    }
    resetConfigAfterCall() {
        const baseURL = this.config.baseURL
        //console.log('baseURL=', baseURL)
        this.config = { ...this.baseConfig, baseURL }
    }
    async execute<T = any>(): Promise<ApiResponse<T>> {
        try {
            //console.log(this.config)
            const response = await this.apiAgent(this.config);
            this.resetConfigAfterCall()
            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
                headers: this.cleanHeaders(response.headers),
            };
        } catch (e: any) {
            this.resetConfigAfterCall()
            console.log(e);
            if (axios.isAxiosError(e)) {
                const response = e.response;
                if (!response) {
                    return {
                        data: null,
                        status: 0,
                        statusText: "Something went wrong",
                        headers: {},
                    };
                }
                return {
                    data: response.data,
                    status: response.status,
                    statusText: response.statusText,
                    headers: this.cleanHeaders(response.headers),
                };
            }
            return {
                data: null,
                status: 0,
                statusText: "Something went wrong",
                headers: {},
            };
        }
    }
}

const apiAgent = new ApiAgent();


const pmsApiAgent = new ApiAgent("https://pms.v-xplore.com");
//const pmsApiAgent = new ApiAgent("http://localhost:3000");
export default apiAgent;
export { pmsApiAgent };
