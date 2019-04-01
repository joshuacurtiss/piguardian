/*
 *  Passcode mixin provides necessary data and functions to help any screen
 *  that needs to use passcodes and a keypad on them.
 *
 */

export const Passcode = {
    data () {
        return {
            passcode: ''
        };
    },
    computed: {
        passcodeFull () {
            return this.passcode.length >= window.settings.keypad.passcodeLength;
        },
        passcodeLength () {
            return window.settings.keypad.passcodeLength;
        },
        passcodeSettings () {
            return window.settings.keypad.passcodes[this.passcode];
        },
        passcodeValid () {
            return window.settings.keypad.passcodes.hasOwnProperty(this.passcode);
        }
    }
};
