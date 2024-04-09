/* eslint-disable @next/next/no-before-interactive-script-outside-document */
"use client"

import Script from "next/script";
import { PyodideInterface } from "pyodide"
import { FC, PropsWithChildren, createContext, useContext, useEffect, useState } from "react";

class PyodideState {
    pyodide: PyodideInterface | null;
    loading: boolean;
    error: string | null;

    constructor(pyodide: PyodideInterface | null, loading: boolean, error: string | null) {
        this.pyodide = pyodide;
        this.loading = loading;
        this.error = error;
    }

    isReady(): boolean {
        return !this.loading && !this.error && this.pyodide !== null;
    }

    getStatus(): { ready: boolean, reason: string } {
        if (this.isReady()) {
            return { ready: true, reason: "ready" };
        } else if (this.loading) {
            return { ready: false, reason: "loading" };
        } else if (this.error) {
            return { ready: false, reason: "error: " + this.error };
        } else {
            return { ready: false, reason: "unknown error" };
        }
    }

    run(code: string): any {
        if (this.pyodide === null) {
            throw new Error("pyodide is not ready");
        }

        try {
            return this.pyodide.runPython(code);
        } catch (err) {
            throw new Error(`Python Runtime Error: ${err}, when running code: ${code}`);
        }
    }

    runJSON(code: string): any {
        
        try {
            return JSON.parse(this.run(code));
        } catch (err) {
            
        }
        return JSON.parse(this.run(code));
    }

    runAsync(code: string): Promise<any> {
        if (this.pyodide === null) {
            return Promise.reject("pyodide is not ready");
        } else {
            return this.pyodide.runPythonAsync(code);
        }
    }

    runAsyncJSON(code: string): Promise<any> {
        return this.runAsync(code).then((result) => {
            return JSON.parse(result);
        });
    }

    evaluate(code: string): Promise<any> {
        if (!this.isReady()) {
            return Promise.reject("Python Runtime Not Ready: " + this.getStatus().reason);
        }

        return this.runAsyncJSON(code).catch((err) => {
            throw new Error(`Python Runtime Error: ${err}`);
        });
    }
}

function escapedJsonStringify(obj: any): string {
    return JSON.stringify(obj).replace(/"/g, '\\"');
}

function javascriptToPython(data: any): string {
    // Note(Mitch): This switch could just be replaced with the default case,
    // but it makes the generated code look nicer if we have direct mappings for the primitive data types.
    switch (typeof data) {
        case "number":
            return escapedJsonStringify(data)
        case "string":
            return `"${data}"`;
        case "boolean":
            return data ? "True" : "False";
        default:
            return `json.loads("${escapedJsonStringify(data)}")`;
    }

}

const PyodideContext = createContext<PyodideState>(new PyodideState(null, true, null));

// async function preparePythonEnvironment(pyodide: PyodideInterface): Promise<void> {
//     await pyodide.loadPackage("micropip");
//     const micropip = pyodide.pyimport("micropip");
//     await micropip.install(`${window.location.origin}/Cryo_UTS-0.1-py3-none-any.whl`);
// }

function isPyodideLoaderReady(): boolean {
 return (typeof (window as any)?.loadPyodide === "function")
}

function loadPyodide(): Promise<PyodideInterface> {
    return (window as any).loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/" });
}


// eslint-disable-next-line max-lines-per-function
export const PyodideProvider: FC<PropsWithChildren> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);

    const success = (pyodide: PyodideInterface) => { setPyodide(pyodide); setLoading(false); };
    const fail = (err: Error) => { setError(err.message); setLoading(false); };

    useEffect(() => {
        if (!isPyodideLoaderReady()) {
            fail(new Error("Pyodide script not loaded"));
            return;
        }

        setLoading(true);
        loadPyodide().then(async (pyodide) => {
            // await preparePythonEnvironment(pyodide);
            success(pyodide);
        })
        .catch(fail);
    }, []);

    const pyodideState = new PyodideState(pyodide, loading, error);
    return (
        <>
            <Script
                async={true}
                strategy="beforeInteractive"
                src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
            />
            <PyodideContext.Provider value={pyodideState}>
                {children}
            </PyodideContext.Provider>
        </>
    );
};

function usePyodide(): PyodideState {
    const context = useContext(PyodideContext);
    if (context === undefined) {
        throw new Error("usePyodide must be used within a PyodideProvider");
    }

    return context;
}

export {
    usePyodide
};