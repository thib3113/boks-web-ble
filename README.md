# Interface Web BLE Boks

Une interface web simple pour interagir avec les boîtes à colis connectées Boks via Web Bluetooth.

## Fonctionnalités
- **Connexion** : Établir une connexion Bluetooth Low Energy (BLE) avec votre appareil Boks.
- **Ouvrir la porte** : Déverrouiller la boîte à distance.
- **Créer des codes** : Générer des codes d'accès pour la boîte.
- **Lire les journaux** : Récupérer l'historique d'utilisation de l'appareil.

## Prérequis
- Un navigateur web compatible avec **Web Bluetooth** (Google Chrome, Microsoft Edge, Opera). *Note : Firefox et Safari ne supportent pas encore totalement Web Bluetooth.*
- L'application doit être servie via **HTTPS** ou accessible via **localhost**. Web Bluetooth nécessite un contexte sécurisé.
- Un appareil disposant de capacités Bluetooth.

## Utilisation

### Hébergement
Le projet est déjà hébergé à l'adresse : **https://thib3113.github.io/boks-web-ble/**

### Guide étape par étape
1.  Ouvrez l'application dans votre navigateur.
2.  Cliquez sur **Connexion** (Connect) et sélectionnez votre appareil Boks dans la liste.
3.  Une fois connecté, utilisez les boutons disponibles pour effectuer des actions :
    - **Ouvrir la porte** : Déclenche le mécanisme de déverrouillage.
    - **Créer des codes** : Génère de nouveaux codes PIN.
    - **Lire les journaux** : Télécharge l'historique des événements de la boîte.

## Avertissement
Ce projet est le résultat d'une rétro-ingénierie et n'est **pas affilié à Boks**. Utilisez ce logiciel à vos propres risques. Les auteurs ne sont pas responsables des dommages ou dysfonctionnements éventuels de votre appareil.

---

# Boks Web BLE Interface

A simple web interface to interact with Boks smart parcel boxes via Web Bluetooth.

## Features
- **Connect**: Establish a Bluetooth Low Energy (BLE) connection with your Boks device.
- **Open Door**: Unlock the parcel box remotely.
- **Create Codes**: Generate access codes for the box.
- **Read Logs**: Retrieve usage logs from the device.

## Prerequisites
- A web browser with **Web Bluetooth** support (Google Chrome, Microsoft Edge, Opera). *Note: Firefox and Safari do not fully support Web Bluetooth yet.*
- The application must be served over **HTTPS** or accessed via **localhost**. Web Bluetooth requires a secure context.
- A device with Bluetooth capabilities.

## Usage

### Hosting
The project is already hosted at: **https://xxxxxxxxx.com**

You can also host this interface using one of the following methods:
1.  **GitHub Pages**: Push the code to a GitHub repository and enable GitHub Pages.
2.  **Local Server**: Use a simple HTTP server (e.g., Python's `http.server` or Node.js `http-server`).
    ```bash
    # Python 3
    python -m http.server 8000
    # Then open http://localhost:8000 in your browser
    ```

### Step-by-Step Guide
1.  Open the application in your browser.
2.  Click **Connect** and select your Boks device from the list.
3.  Once connected, use the available buttons to perform actions:
    - **Open Door**: Triggers the unlock mechanism.
    - **Create Codes**: Generates new PIN codes.
    - **Read Logs**: Downloads the event history from the box.

## Disclaimer
This project is a result of reverse engineering and is **not affiliated with Boks**. Use this software at your own risk. The authors are not responsible for any damage or malfunction of your device.
