<template>
  <div :id="id" :ref="id"></div>
</template>
<script>
import QRCode from 'qrcodejs2'
export default {
  data() {
    return {
      qrcode: ''
    }
  },
  props: {
    id: {
      type: String,
      required: true
    },
    codeUrl: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: '200'
    },
    height: {
      type: String,
      default: '200'
    },
    colorDark: {
      type: String,
      default: '#000000'
    },
    colorLight: {
      type: String,
      default: '#ffffff'
    }
  },
  watch: {
    codeUrl() {
      this.createQrcode()
    }
  },
  mounted() {
    this.createQrcode()
  },
  methods: {
    // 有新的二维码地址了，先把之前的清除掉
    createQrcode() {
      if (this.qrcode) {
        this.$refs[this.id].innerHTML = ''
      }
      this.qrcode = new QRCode(this.$refs[this.id], {
        text: this.codeUrl,
        width: this.width,
        height: this.height,
        colorDark: this.colorDark,
        colorLight: this.colorLight,
        correctLevel: QRCode.CorrectLevel.H
      })
    }
  }
}
</script>
