export default class Event {
    constructor (message = '', timestamp = new Date(), active = true) {
        this.message = message;
        if (timestamp) this.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
        this.active = active;
        return this;
    }
}
