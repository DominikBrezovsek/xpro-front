<template>
  <Navbar />
</template>

<script setup>

import Navbar from "@/components/Navbar.vue";
import axios from "axios";
import {onMounted} from "vue";

function getData(){
  const data = new FormData();
  const url = "http://localhost:5064/api/WorkTime/getUserWorkTimes";
  data.append("userId", sessionStorage.getItem("userId"));
  axios.post(url, data,
      {
        headers: {
          'Authorization': 'Bearer ' + sessionStorage.getItem('token'),
        }
      }).then(res => {
        console.log(res);
  })
}

onMounted(() => {
  getData();
})
</script>
