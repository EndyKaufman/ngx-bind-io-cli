export function getBetween(text: string, prefix: string, suffix: string): string[] {
    let local_text = '';
    let results: string[] = [];

    return get(text, prefix, suffix);

    function getFromBetween(local_prefix: string, local_suffix: string) {
        try {
            let s = local_text;
            let i = s.indexOf(local_prefix);
            if (i >= 0) {
                s = s.substring(i + local_prefix.length);
            } else {
                return null;
            }
            if (local_suffix) {
                i = s.indexOf(local_suffix);
                if (i >= 0) {
                    s = s.substring(0, i);
                } else {
                    return null;
                }
            }
            return s;
        } catch (error) {
            console.error(error);
        }
    }
    function removeFromBetween(prefix: string, suffix: any) {
        try {
            const removal = prefix + getFromBetween(prefix, suffix);
            local_text = local_text.replace(removal, '');
        } catch (error) {
            console.error(error);
        }
    }
    function getAllResults(prefix: any, suffix: any) {
        try {
            const prevString = local_text;
            const result = getFromBetween(prefix, suffix);
            if (result) {
                results.push(result);
            }
            removeFromBetween(prefix, suffix);
            if (prevString !== local_text) {
                getAllResults(prefix, suffix);
            } else {
                return;
            }
        } catch (error) {
            console.error(error);
        }
    }
    function get(text: any, local_prefix: any, local_suffix: any) {
        try {
            results = [];
            local_text = text;
            getAllResults(local_prefix, local_suffix);
            return results;
        } catch (error) {
            console.error(error);
        }
        return [];
    }
}
