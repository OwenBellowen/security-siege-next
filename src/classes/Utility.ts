export default class Utility {
    public static async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public static capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}