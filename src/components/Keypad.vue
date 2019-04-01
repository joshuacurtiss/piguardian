<template>
    <form>
        <h1>{{ title }}</h1>
        <div class="passcodeui">
            <font-awesome-icon
                v-for='index in maxlength'
                :key='index'
                style='padding: 0 0.8vw;'
                :icon='passcode.length>=index ? ["fas","circle"] : ["far","circle"]'
            />
        </div>
        <button type="button" @click='addDigit(1)'>1 <div>&nbsp;</div></button>
        <button type="button" @click='addDigit(2)'>2 <div>abc</div></button>
        <button type="button" @click='addDigit(3)'>3 <div>def</div></button>
        <button type="button" @click='addDigit(4)'>4 <div>ghi</div></button>
        <button type="button" @click='addDigit(5)'>5 <div>jkl</div></button>
        <button type="button" @click='addDigit(6)'>6 <div>mno</div></button>
        <button type="button" @click='addDigit(7)'>7 <div>pqrs</div></button>
        <button type="button" @click='addDigit(8)'>8 <div>tuv</div></button>
        <button type="button" @click='addDigit(9)'>9 <div>wxyz</div></button>
        <button type="button" @click='clearDigits()' class='function'>clear</button>
        <button type="button" @click='addDigit(0)'>0</button>
        <button type="button" @click='deleteDigit()' class='function'>delete</button>
    </form>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle as faCircleThin } from '@fortawesome/free-regular-svg-icons';
library.add(faCircle, faCircleThin);
export default {
    name: 'Keypad',
    components: {
        FontAwesomeIcon
    },
    data () {
        return {
            passcode: ''
        };
    },
    props: {
        maxlength: {
            type: Number,
            default: 4
        },
        title: {
            type: String,
            default: 'Enter Passcode'
        },
        value: {
            type: String
        }
    },
    watch: {
        value (newval) {
            this.passcode = newval;
        }
    },
    computed: {
        passcodeFull () {
            return this.passcode.length >= this.maxlength;
        }
    },
    methods: {
        addDigit (digit) {
            if (!this.passcodeFull) {
                this.passcode += digit.toString();
                this.$emit('input', this.passcode);
            }
        },
        clearDigits () {
            this.passcode = '';
            this.$emit('input', this.passcode);
        },
        deleteDigit () {
            if (this.passcode.length) {
                this.passcode = this.passcode.substr(0, this.passcode.length - 1);
                this.$emit('input', this.passcode);
            }
        }
    }
};
</script>

<style scoped>
form {
    width: 30.2vw;
    border-radius: 10px;
}
form h1 {
    font-size: 18px;
    font-weight: normal;
    text-align: center;
    padding: 15px 0 0 0;
    margin: 0;
}
.passcodeui {
    margin: 12px 0 10px 0;
    text-align: center;
}
.passcodeui i {
    letter-spacing: 9px;
}
button {
    border-radius: 50%;
    border: 1px solid #ccc;
    background-color: #e2e2e2;
    margin: 10px;
    width: 60px;
    height: 60px;
    font-size: 24px;
}
button:focus {
    outline: 0;
}
button:active {
    background-color: #ccc;
}
button.function {
    font-size: 12px;
    background-color: transparent;
    padding-top: -5px;
    border:0;
}
button div {
    font-size: 8px;
    margin-top: -2px;
    text-transform: uppercase;
}
</style>
