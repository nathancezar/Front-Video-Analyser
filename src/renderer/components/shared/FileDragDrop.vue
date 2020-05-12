<template>
    <div>
        <b-field>
          <b-upload
              ref="bUpload"
              multiple
              v-model="dropFiles"
              v-on:input="onFileInput"
              v-bind:class="{ 'border-is-danger': !fileValidation.valid }"
              drag-drop
              expanded>
              <section class="section">
                  <div class="content has-text-centered">
                      <p>
                          <font-awesome-icon icon="file-upload" size="2x" />
                      </p>
                      <p>Clique para selecionar ou arraste os arquivos e pastas para cá.</p>
                  </div>
              </section>
          </b-upload>
        </b-field>
        <template v-if="!fileValidation.valid">
          <p class="help btn btn-danger">
            {{ fileValidation.msg }}
          </p>
        </template>

        <div class="center">
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th>Vídeo</th>
                <!-- <th>Sentido</th> -->
                <th>Excluir</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(file, index) in fileList"
              :key="index"
              >
                <td>{{ file }}</td>
                <!-- <td><input type="number" required value="1" min="1" max="2" class="numberFile" v-model.number="sentidoList[index]"></td> -->
                <td><button class="delete btn btn-danger" type="button" :disabled="processRunning && index == 0" @click="deleteFile(index)"></button></td>
              </tr>
            </tbody>
          </table>
        </div>
    </div>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFileUpload } from '@fortawesome/free-solid-svg-icons'
import fs from 'fs'
import path from 'path'

library.add(faFileUpload)

export default {
  data () {
    return {
      dropFiles: [],
      fileList: [],
      // sentidoList: [],
      fileValidation: {
        valid: true,
        msg: ''
      },
      processRunning: false
    }
  },
  methods: {

    deleteAll () {
      this.dropFiles = []
      this.fileList = []
      // this.sentidoList = []
    },

    deleteFile (index) {
      this.dropFiles.splice(index, 1)
      this.fileList.splice(index, 1)
      // this.sentidoList.splice(index, 1)
    },

    onFileInput (fileArr) {
      const dirIndexes = []
      for (let i = 0; i < fileArr.length; i += 1) {
        this.doFileInsert(fileArr[i], i, dirIndexes)
      }
    },

    doFileInsert (file, i, dirIndexes) {
      if (file.type !== '' && file.type !== 'video/mp4') {
        this.deleteFile(i)
        return
      }

      if (fs.statSync(file.path).isDirectory()) {
        dirIndexes.push(i)
        const childrenFiles = fs.readdirSync(file.path, {})

        for (let j = 0; j < childrenFiles.length; j += 1) {
          if (childrenFiles[j].toUpperCase().endsWith('.MP4')) {
            const childFileName = childrenFiles[j]

            var path1 = path.join(file.path, childFileName)
            const alreadyExists = this.fileList.find(item => item === path1)

            if (!alreadyExists) {
              this.fileList.push(path.join(file.path, childFileName))
              // this.sentidoList.push(1)
            }
          }
        }
      } else if (file.type === 'video/mp4') {
        const alreadyExists = this.fileList.find(item => item === file.path)

        if (!alreadyExists) {
          this.fileList.push(file.path)
          // this.sentidoList.push(1)
        }
      }
    },

    showValidation (validation) {
      this.fileValidation = validation
      this.$refs.bUpload.setInvalid()
    },
    updateProcessRunning (payload) {
      this.processRunning = payload
    }
  },
  watch: {
    fileList (newValue) {
      this.$emit('changeFile', newValue)
    }
    // sentidoList (newValue1) {
    // this.$emit('changeSentido', newValue1)
    // }
  }
}
</script>

<style>
.upload.control{
  display: unset;
}
.border-is-danger > .upload-draggable {
  border: 1px dashed hsl(348, 100%, 61%);
}

.numberFile{font-size: 16px;}

.center{text-align: center;}
</style>