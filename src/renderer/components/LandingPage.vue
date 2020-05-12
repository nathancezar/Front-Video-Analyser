<template>
  <section>
    <div class="container">

      <div class="header">
        <img src='../assets/logo.png' alt="Labtrans Logo" class="logo">
        <h1 class="h1">Video Analyser</h1>
        <font-awesome-icon icon="sign-out-alt" size="2x" class="exit" v-on:click="close" />
      </div>

      <div class="content1">
        <div class="columns">
          <div class="column is-half" id="divColumnLeft">

            <div class="column" id="divProjeto">
              <b-field label='Projeto'>
                <b-input type="text" name="projeto" v-model="projeto" ref="projeto"></b-input>
              </b-field>
              <b-checkbox size="is-small" name="rodoviaFederal" v-model="rodoviaFederal">Rodovia Federal</b-checkbox>
            </div>

            <div class="column is-full" id="radioButton">
              <b-field label="Realizar processamentos com: "></b-field>
              <b-radio v-model="device" name="device" native-value="cpu" size="is-small">CPU</b-radio>
              <b-radio v-model="device" name="device" native-value="cuda" size="is-small">GPU</b-radio>
            </div> <!-- final div radio button -->

            <div class="column is-full" id="divCheckbox">
              <b-field label="Objetos a serem identificados"></b-field>
              <b-checkbox size="is-small" name="placas" v-model="placas">Placas</b-checkbox>
              <b-checkbox size="is-small" name="buracos" v-model="buracos">Buracos</b-checkbox>
              <b-checkbox size="is-small" name="remendos" v-model="remendos">Remendos</b-checkbox>
              <b-checkbox size="is-small" name="drenagem" v-model="drenagem">Drenagem</b-checkbox>
              <b-checkbox size="is-small" name="faixas" v-model="faixas">Sinalisação Horizontal</b-checkbox>
              <b-checkbox size="is-small" name="rocada" v-model="rocada">Roçada</b-checkbox>
              <b-checkbox size="is-small" name="trincas" v-model="trincas">Trincas</b-checkbox>
              <b-checkbox size="is-small" name="acostamento" v-model="acostamento">Acostamento</b-checkbox>
              <b-checkbox size="is-small" name="faixaPedestres" v-model="faixaPedestres">Faixa de Pedestres</b-checkbox>
              <b-checkbox size="is-small" name="marco" v-model="marco">Marco Quilométrico</b-checkbox>

            </div> <!-- final div checkbox -->

            <div class="column is-full" id="divDragDrop">
              <fileDragDrop
                ref="fileDragDrop"
                @changeFile="onFilesChanged"
                required>
              </fileDragDrop>
            </div>

            <div class="columns" id="divProcess">
              <div class="column is-half">
                <b-button type="is-success" @click="validateAndStart" expanded :loading="processRunning">Processar</b-button>
              </div>
              <div class="column">
                <b-button type="is-danger" @click="stopProcess" expanded :disabled="!processRunning">Cancelar</b-button>
              </div>
            </div>

          </div> <!-- final div coluna esquerda -->

          <div class="column" id="divColumnRight">
            <b-field label="Log de Processamento">
              <b-input type="textarea"
                expanded
                size="is-large"
                disabled
                v-model="log"
                rows="11"
                style="overflow-y: scroll;"
                custom-class="is-size-7 is-family-code has-fixed-size"
                >
              </b-input>
            </b-field>
          </div>

        </div> <!-- final div columns -->
      </div> <!-- final div content1 -->

      <div class="footer1">
        <p class="videoProcess" v-if="!processRunning">Não há vídeos sendo analisados</p>

        <div class="progress-container">
          <template v-if="progress >= 0 && processRunning">
            <p>
              Processando vídeo {{ (queueLength - fileList.length + 1) }} de {{ queueLength }}. 
            </p>
            <b-progress :value="progress" 
            show-value 
            format="percent"
            type="is-success"
            size="is-medium">
            </b-progress>
          </template>
        </div>

      </div> <!-- final div footer -->

    </div> <!-- final div container -->
  </section>
</template>

<script>
// import { Op } from "sequelize"
import FileDragDrop from './shared/FileDragDrop'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSignOutAlt, faArrowCircleLeft, faArrowCircleRight, faUpload } from '@fortawesome/free-solid-svg-icons'
const remote = require('electron').remote

library.add(faSignOutAlt, faArrowCircleLeft, faArrowCircleRight, faUpload)

export default {
  name: 'landing-page',
  components: {
    FileDragDrop
  },
  data () {
    return {
      window: remote.getCurrentWindow(),
      projeto: '',
      rodovia: '',
      log: '',
      device: 'cpu',

      rodoviaFederal: true,
      placas: false,
      drenagem: false,
      buracos: false,
      remendos: false,
      rocada: false,
      faixas: false,
      acostamento: false,
      marco: false,
      faixaPedestres: false,
      trincas: false,

      processRunning: false,
      progress: 0,
      fileList: [],
      queueLength: 0,
      videosProcessados: 1,
      qtdVideos: null

    }
  },
  methods: {
    onFilesChanged (newFileList) {
      this.fileList = newFileList
    },
    close () {
      this.window.close()
    },
    validateAndStart () {
      if (!this.projeto) {
        // abrir snackbar para dar aviso
        this.$buefy.snackbar.open({
          message: 'O seguinte campo deve ser preenchido: Projeto',
          type: 'is-info',
          position: 'is-top',
          actionText: null
        })
      } else if (!this.placas && !this.drenagem && !this.buracos && !this.rocada &&
        !this.faixas && !this.acostamento && !this.marco && !this.faixaPedestres &&
        !this.trincas && !this.remendos) {
        // abrir snackbar para dar aviso
        this.$buefy.snackbar.open({
          message: 'Selecione pelo menos 1 item para processar.',
          type: 'is-info',
          position: 'is-top',
          actionText: null
        })
      } else if (this.fileList.length === 0) {
        // abrir snackbar para dar aviso
        this.$buefy.snackbar.open({
          message: 'Nenhum vídeo selecionado.',
          type: 'is-info',
          position: 'is-top',
          actionText: null
        })
      } else {
        this.queueLength = this.fileList.length
        this.process()
      }
    },
    process () {
      var parametros = ''

      if (!this.rodoviaFederal) parametros += ' not_federal'
      if (this.placas) parametros += ' signal'
      if (this.buracos) parametros += ' pothole'
      if (this.remendos) parametros += ' repair'
      if (this.drenagem) parametros += ' drainage'
      if (this.faixas) parametros += ' lane'
      if (this.rocada) parametros += ' clearing'
      if (this.trincas) parametros += ' crack'
      if (this.acostamento) parametros += ' roadside'
      if (this.faixaPedestres) parametros += ' crosswalk'
      if (this.marco) parametros += ' milestone'

      const payload = {
        args: parametros,
        video: this.fileList[0],
        project: this.projeto,
        device: this.device
      }

      console.log(payload)
      const videoName = this.fileList[0].split('/').slice(-1)[0]

      this.$buefy.snackbar.open({
        message: 'Aguarde, avaliando os arquivos de vídeo.',
        type: 'is-info',
        position: 'is-top',
        actionText: null,
        queue: false
      })

      this.logMsg(videoName, 'Vídeo sendo analisado')
      this.pyError = null
      this.processRunning = true
      this.$PyComm.pyOptions.args = JSON.stringify(payload, null, 2)
      this.pyProcess = this.$PyComm.PythonShell.run(
        'main.py',
        this.$PyComm.pyOptions, (msg) => {
          if (!this.processRunning) {
            this.logMsg(videoName, 'Execução cancelada.')
            return
          }
          this.processRunning = false

          if (msg || this.pyError) {
            this.onProcessingError(videoName, this.pyError)
            return
          }
          this.$buefy.snackbar.open({
            message: `Vídeo ${videoName} processado com sucesso.`,
            type: 'is-success',
            actionText: null,
            queue: false,
            position: 'is-top'
          })
          this.logMsg(videoName, 'Vídeo processado com sucesso')

          this.progress = 0
          this.onFileRemove(0)

          if (this.fileList.length > 0) {
            this.process()
          }
        }
      )
      // Código para mostrar no console todos os prints do python
      // this.pyProcess.on('message', (msg) => {
      //   console.log(msg)
      // })

      this.pyProcess.on('message', (msg) => {
        if (msg.includes('progress')) {
          this.progress = JSON.parse(msg.replace(/'/g, '"')).progress
          if (this.progress === 0) {
            this.logMsg(videoName, 'Vídeo válido, início de processamento')
            this.$buefy.snackbar.open({
              message: `Vídeo ${videoName} foi validado com sucesso.`,
              type: 'is-success',
              position: 'is-top',
              actionText: null,
              queue: false
            })
          }
        } else if (msg.includes('error')) {
          this.pyError = msg
        }
      })
    },
    onFileRemove (index) {
      this.$refs.fileDragDrop.deleteFile(index)
    },
    logMsg (fileName, msg) {
      this.log += `Vídeo ${fileName.toUpperCase()} - ${msg}\n`
    },
    stopProcess () {
      if (this.pyProcess) {
        this.processRunning = false
        this.progress = 0
        this.pyProcess.terminate()
      }
    },
    getErrorDescription (errorCode) {
      const errors = {
        '1': 'Arquivo não pode ser aberto (corrompido/fora do padrão)',
        '2': 'Resolução diferente da padrão',
        '3': 'FPS diferente do padrão',
        '4': 'Não foi possível extrair os dados de GPS',
        '5': 'O identificador do contrato está ausente',
        '6': 'A rodovia especificada é diferente daquela encontrada no SNV',
        '7': 'O Estado do contrato é diferente daquele encontrado no SNV',
        '8': 'Vídeo já registrado no Banco de Dados',
        '9': 'Diretório Vazio',
        '10': 'O ICM do vídeo atual já foi gerado',
        '11': 'Nenhum arquivo CSV foi encontrado',
        '12': 'Arquivo CSV encontrado possui campo(s) inválido(s)',
        '13': 'O vídeo não corresponde ao estado/rodovia selecionados no contrato',
        '14': 'Caminho para salvar o arquivo é inválido ou foi omitido.',
        '15': 'Não foi possível criar o arquivo.',
        '16': 'Não foi possível gerar o ICM.',
        '17': 'Video não corresponde a uma Rodovia Federal'
      }
      return errors[errorCode]
    },
    onProcessingError (fileName, strErr) {
      const errorCode = JSON.parse(strErr).error_code

      var description = this.getErrorDescription(errorCode)

      this.$buefy.dialog.confirm({
        title: 'Erro ao processar',
        message: `Ocorreu um erro ao processar o vídeo ${fileName}. ${description}`,
        canCancel: false,
        confirmText: 'OK',
        type: 'is-danger'
      })
      this.logMsg(fileName, 'Erro ao processar o video')
    }
  }
}
</script>

<style>
  .logo{left: 5px; top: 5px; position: absolute; display: flex; height: 45px;}
  .h1{font-size: 24px; font-weight: bolder;}
  h1, p, .center{text-align: center;}
  .exit{right: 5px; top: 5px; position: absolute; display: flex;}
  .header{margin-bottom: 10px;}
  .footer1{margin-top: 10px;}

  input[type="number"]{width: 50px;}
  input[type="text"]{padding: 5px; font-size: 16px;}

  .videoProcess{position: absolute;}

  .blank-space{height: 30px; background-color: #a8a8a8; color: white;}
  .logProcessamento{height: 150px;}

  .exit{cursor: pointer;}
  .container{padding-left: 10px; padding-right: 10px;}

  .content1{margin-top: 10px;}

  #divCheckbox, #divDragDrop, #divProcess, #radioButton{padding-top: 5px;}
  #divColumnLeft,#divCheckbox, #divDragDrop, #divProjeto, #radioButton{padding-left: 5px;}
  #divColumnRight{padding-right: 5px;}

</style>
