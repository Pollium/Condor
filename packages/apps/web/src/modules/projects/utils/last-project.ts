const KEY = 'condor.project';

export const readLastProject = (): string | null => {
    try{
        return localStorage.getItem(KEY);
    }catch{
        return null;
    }
};

export const rememberProject = (projectId: string) => {
    try{
        localStorage.setItem(KEY, projectId);
    }catch{
        return;
    }
};
