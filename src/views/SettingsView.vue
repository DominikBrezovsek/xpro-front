<template>
  <div class="inline-flex w-screen h-screen">
    <Toast ref="toast" />
    <Navbar/>
    <Card class="m-auto p-2">
      <template #content>
        <p class="text-xl p-2 mb-8">{{ t('settingsTitle') }}</p>
        <div class="p-2 w-full inline-flex items-center gap-4">
          <div>
          <p class="text-lg pb-4">{{ t('settingsPassResetTitle') }}</p>
          <FloatLabel variant="on" class="mb-4">
            <label for="pass">{{ t('passResetCurrent') }}</label>
            <InputText type="password" id="pass" v-model="currentPass"/>
          </FloatLabel>
          <FloatLabel variant="on" class="mb-4">
            <label for="passNew">{{ t('passResetNew') }}</label>
            <InputText type="password" id="passNew" v-model="newPass" @keyup="checkNewPass()"/>
          </FloatLabel>
          <FloatLabel variant="on" class="mb-4">
            <label for="passNewAgain">{{ t('passResetAgain') }}</label>
            <InputText type="password" id="passNewAgain" v-model="newPassRepeat" @keyup="checkNewPass"/>
          </FloatLabel>
          <Button :label="t('passResetSaveBtn')" icon="pi pi-refresh" icon-pos="right" class="px-3" @click="updatePassword()"/>
          </div>
          <div>
            <Card class="p-2" v-if="showPassTips">
              <template #content>
                <div class="flex flex-col gap-2">
                  <div class="inline-flex items-center gap-3" :class="lengthStatus">
                    <i :class="lengthIcon"></i>
                    <p>{{t('passwordLength')}}</p>
                  </div>
                  <div class="inline-flex items-center gap-3" :class="numberStatus">
                    <i :class="numberIcon"></i>
                    <p>{{t('passwordNumber')}}</p>
                  </div>
                  <div class="inline-flex items-center gap-3" :class="capitalStatus">
                    <i :class="capitalIcon"></i>
                    <p>{{t('passwordCapital')}}</p>
                  </div>
                  <div class="inline-flex items-center gap-3" :class="specialStatus">
                    <i :class="specialIcon"></i>
                    <p>{{t('passwordSpecial')}}</p>
                  </div>
                  <div class="inline-flex items-center gap-3" :class="matchStatus">
                    <i :class="matchIcon"></i>
                    <p>{{t('matchPass')}}</p>
                  </div>
                </div>

              </template>
            </Card>
          </div>
        </div>
        <div class="mt-8 p-2 flex flex-col gap-2">
          <p class="text-lg">{{ t('settingsPictureTitle') }}</p>
          <FileUpload name="image" url="http://localhost:5064/api/User/setProfilePicture"
                      @before-send="setHeaders($event)" @beforeUpload="onPictureUpload($event)"
                      accept="image/*" :maxFileSize="2097152" :choose-label="t('pictureSelectButton')"
                      :upload-label="t('pictureUploadButton')" :cancel-label="t('pictureRejectButton')"
                      :file-limit=fileLimit :invalid-file-limit-message="t('pictureLimitExceeded')"
                      :invalid-file-type-message="t('notAPicture')"
                      :invalid-file-size-message="t('tooLarge')">
            <template #empty>
              <span>{{ t('settingsPictureUpload') }}</span>
            </template>
          </FileUpload>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>

import Navbar from "@/components/Navbar.vue";
import {Card, InputText, FloatLabel, Button, FileUpload, Toast} from "primevue";
import {useI18n} from "vue-i18n";
import {ref} from "vue";
import axios from "axios";

const {t} = useI18n();
const toast = ref(null);
const fileLimit = 1;
var currentPass = ref();
var newPass = ref(null);
var newPassRepeat = ref(null);
const newPassIsValid = ref(false);
const lengthIcon = ref();
const numberIcon = ref();
const capitalIcon = ref();
const specialIcon = ref();
const lengthStatus = ref();
const numberStatus = ref();
const capitalStatus = ref();
const specialStatus = ref();
const matchStatus = ref();
const matchIcon = ref();
const showPassTips = ref(false)

function onPictureUpload(image) {
  var data = image.formData
  data.append('userId', sessionStorage.getItem('userId'))
  console.log(image.formData)
}

function setHeaders(image) {
  if (image.xhr.readyState == 1) {
    image.xhr.setRequestHeader('Authorization', 'Bearer ' + sessionStorage.getItem('token'))
  } else {
    setHeaders(image);
  }
}

function updatePassword() {
  if (!currentPass.value) {
    toast.value.add({
      severity: "warn",
      summary: t('inputError'),
      detail: t('currentPassEmpty'),
      closable: true,
      life: 3000
    })
  }
  if (newPassIsValid.value === true) {
    var data = new FormData();
    data.append('userId', sessionStorage.getItem('userId'))
    data.append('newPass', newPass.value)
    data.append('currentPass', currentPass.value)
    const url = "http://localhost:5064/api/User/setNewPassword"
    axios.post(url, data,
        {
          headers: {Authorization: 'Bearer ' + sessionStorage.getItem('token')}
        }
    ).then(res => {
      if (res.data.error === "wrongCurrentPass") {
        toast.value.add({
          severity: "error",
          summary: t('saveError'),
          detail: t('currentPassWrong'),
          closable: true,
          life: 3000
        })
      } else {
        toast.value.add({
          severity: "success",
          summary: t('saveSuccess'),
          detail: t('passResetSuccess'),
          closable: true,
          life: 3000
        })
        currentPass.value = newPass.value = newPassRepeat.value = null
      }
    });
  }
}
function checkNewPass(){
  showPassTips.value = true;
  const uppercase = /[A-Z]/;
  const digit = /\d/;
  const special = /[@.#$!%^&*.?]/
  if (!uppercase.test(newPass.value)) {
    capitalStatus.value = "text-red-500"
    capitalIcon.value = "pi pi-times"
   } else {
    capitalStatus.value = "text-green-500"
    capitalIcon.value = "pi pi-check"
  }
  if (!digit.test(newPass.value)) {
    numberStatus.value = "text-red-500"
    numberIcon.value = "pi pi-times"
  } else {
    numberStatus.value = "text-green-500"
    numberIcon.value = "pi pi-check"
  }
  if (!special.test(newPass.value)) {
    specialStatus.value = "text-red-500"
    specialIcon.value = "pi pi-times"
  } else {
    specialStatus.value = "text-green-500"
    specialIcon.value = "pi pi-check"
  }
  if (newPass.value.length < 8) {
    lengthStatus.value = "text-red-500"
    lengthIcon.value = "pi pi-times"
  } else {
    lengthStatus.value = "text-green-500"
    lengthIcon.value = "pi pi-check"
  }
  if (newPass.value != newPassRepeat.value) {
    matchStatus.value = "text-red-500"
    matchIcon.value = "pi pi-times"
  } else if(newPass.value && newPassRepeat.value) {
    matchStatus.value = "text-green-500"
    matchIcon.value = "pi pi-check"
  }
  if (uppercase.test(newPass.value) && digit.test(newPass.value) && special.test(newPass.value) &&
      newPass.value.length >= 8 && newPass.value === newPassRepeat.value) {
    newPassIsValid.value = true;
    showPassTips.value = false;
  }

}
</script>
