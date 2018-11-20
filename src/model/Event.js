import moment from 'moment';
const TIMEFMT = 'h:mm A';
export default class Event {
    constructor (timestamp, message, active = true) {
        this.timestamp = moment(timestamp);
        this.message = message;
        this.active = active;
        return this;
    }
    toString () {
        return `${this.timestamp.format(TIMEFMT)}: ${this.message}`;
    }
}
