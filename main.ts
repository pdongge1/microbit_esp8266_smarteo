namespace ESP8266Smarteo {
    
    function sendAT(command : string, wait : number = 0) {
        serial.writeString(command + "\u000D\u000A")
        basic.pause(wait)
    }

    function handleCommand(commands : string) {
        if (commands.includes("allumer_led")) {
            basic.clearScreen()
            basic.showIcon(IconNames.Square)
        }
        else if (commands.includes("eteindre_led")) {
            basic.clearScreen()
        }
        else if (commands.includes("fermer")) {
            sendAT("AT+CIPCLOSE", 1000)
        }
    }

    function resetESP() {
        sendAT("AT+RESTORE", 1000) // restore to factory settings
        sendAT("AT+RST", 1000) // reset the module
        do {
            sendAT("AT", 500) // test command
            let response = serial.readString()
            if (response.includes("OK")) {
                basic.showIcon(IconNames.Yes)
                basic.pause(2000)
                break // Sortir de la boucle si la réponse est OK
            } else {
                basic.showIcon(IconNames.No)
                basic.pause(2000) // Attendre avant de réessayer
            }
        } while (true) // Boucle infinie jusqu'à ce que la condition soit remplie
        sendAT("AT+CWMODE=1") // set to station mode
    }
    
    /**
     * Initialize ESP8266 module
     */
    //% block='set ESP8266 Tx %tx Rx %rx Baudrate %baudrate'
    //% tx.defl='SerialPin.P14'
    //% rx.defl='SerialPin.P0'
    //% baudrate.defl='baudrate.BaudRate115200'
    export function initesp8266(tx : SerialPin, rx : SerialPin, baudrate : BaudRate) {
            serial.redirect(tx, rx, BaudRate.BaudRate115200)
            serial.setTxBufferSize(128)
            serial.setRxBufferSize(128)
            do {
                sendAT("AT", 500)
                let test = serial.readString()
                if (test.includes("OK")) {
                    basic.showIcon(IconNames.Duck)
                    basic.pause(2000)
                    break
                }
                else {
                    basic.showIcon(IconNames.Snake)
                    basic.pause(2000)
                }
            } while (true)
            resetESP()
    }
    

    /**
     * Connect to Wifi router
     */
    //% block='Connect Wifi SSID %ssid password %password ip address %ip_address'
    //% ssid.defl='Smarteo'
    //% password.defl='%Smarteo123'
    //% ip_address.defl='192.168.1.30'
    export function connectToWifi(ssid : string, password : string, ip_address : string) {
        sendAT("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"", 0)
        let response2 = serial.readString()
        if (response2.includes("OK")) {
            basic.showIcon(IconNames.Happy)
            basic.pause(3000)
            sendAT("AT+CIPSTA=\"" + ip_address + "\"", 0)
            let responseip = serial.readString()
            if (responseip.includes("OK")) {
                basic.showIcon(IconNames.Surprised)
                basic.pause(2000)
            } 
            else {
                basic.showIcon(IconNames.Silly)
                basic.pause(2000)
            }
        }
        else if (response2.includes("ERROR")) {
            basic.showIcon(IconNames.Angry)
            basic.pause(2000)
        }
    }
    /**
     * Connect to a tcp server
     */
    //% block='Connect tcp serveur %serverIP and port %port'
    //% serverIP.defl='127.0.0.1'
    //% port.defl='8080'
    export function connectTCPServer (serverIP : string, port : string) {
        sendAT("AT+CIPSTART=\"TCP\",\"" + serverIP + "\"," + port, 5000);
        let connectResponse = serial.readString()
        if (connectResponse.includes("OK")) {
            basic.showIcon(IconNames.Heart)
            let identificationMessage = "IDENTIFY: Microbit"
            sendAT("AT+CIPSEND=" + identificationMessage.length)
            sendAT(identificationMessage)
        }
        else if (connectResponse.includes("ERROR")) {
            basic.showIcon(IconNames.Sad)
            return
        }
    }

    /**
     * Send data on button press
     */
    //% block='Send data %data on button %button'
    //% data.defl='Hello, World !'
    //% button.defl='Button.A'
    export function sendDataOnButtonPress (data : string, button : Button) {
        input.onButtonPressed(button, function() {
            let fullmessage = data + "\n"
            sendAT("AT+CIPSEND=" + fullmessage.length)
            sendAT(fullmessage)
        })
    }

    /**
     * Close TCP connection
     */
    //% block
    export function closeTCPConnection() {
        sendAT("AT+CIPCLOSE", 1000)
    }

    /**
     * Listen for commands 
     */
    //% block
    export function listenMatrix() {
        while (true) {
            let response3 = serial.readString()
            if(response3) {
                handleCommand(response3)
            }
            basic.pause(100)
        }
    }
    /**
     * Send Accelerometer Data
     */
    //% block
    export function sendAccelerometerData() {
        let accX = input.acceleration(Dimension.X)
        let accY = input.acceleration(Dimension.Y)
        let accZ = input.acceleration(Dimension.Z)
        let accData = `ACCEL:${accX},${accY},${accZ}\n`
        sendAT("AT+CIPSEND=" + accData.length)
        sendAT(accData)
    }

    /**
     * Send temperature Data
     */
    //% block
    export function sendTemperatureData() {
        let tempData = `TEMP:${input.temperature()}\n`
        sendAT("AT+CIPSEND=" + tempData.length)
        sendAT(tempData)
    }

    /**
     * Send brightness data
     */
    //% block
    export function sendBrightnessData() {
        let brightData = `LIGHT:${input.lightLevel()}\n`
        sendAT("AT+CIPSEND=" + brightData.length)
        sendAT(brightData)
    }

    /**
     * Send Compass Data
     */
    //% block
    export function sendCompassData() {
        let compassData = `COMPASS:${input.compassHeading()}\n`
        sendAT("AT+CIPSEND=" + compassData.length)
        sendAT(compassData)
    } 
}
