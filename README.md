# Xat en Temps Real amb Angular i Node.js

Aquest projecte és un xat en temps real desenvolupat amb **Angular 18.2.13** al frontend i **Node.js 20.13.0** amb **Express** al backend. S'utilitza **Socket.io** per a la comunicació en temps real i **SQL Server** com a base de dades.

## Índex

- [Requisits previs](#requisits-previs)
- [Instal·lació del projecte](#instal·lacio-del-projecte)
- [Configuració de la base de dades en SQL Server](#configuracio-de-la-base-de-dades-en-sql-server)
- [Configuració de variables d'entorn](#configuracio-de-variables-dentorn-env)
- [Execució del Backend i Frontend](#execució-del-backend-i-frontend)
- [Notes addicionals](#notes-addicionals)
- [Endpoints](#endpoints)
- [Diagrama Entitat Relació](#diagrama)
- [Estructura de carpetes](#estructura)
- [Errors HTTP](#errors)
- [Suport](#suport)

## Requisits previs

Abans de començar, assegura't de tenir instal·lat el següent a la teva màquina:

- **Node.js** (v20.13.0 o superior)
- **npm** (s'instal·la junt amb Node.js)
- **Angular CLI** (si vols modificar el frontend, es recomana instal·lar-lo globalment amb `npm install -g @angular/cli`)
- **SQL Server** (versió compatible, junt amb les eines d'administració que prefereixis, com ara SQL Server Management Studio)

## Instal·lació del projecte

1.  **Clonar el repositori**

    Clona el repositori a la teva màquina local:

    Amb https

    ```bash
    git clone https://github.com/Jonathan0256/Chat-Projecte.git
    ```

    Amb ssh

    ```bash
    git clone git@github.com:Jonathan0256/Chat-Projecte.git
    ```

2.  **Instal·lar les dependències**

    Backend

    ```bash
    cd backend
    npm install
    ```

    Frontend

    ```bash
    cd src
    npm install
    ```

    Socket

    ```bash
    cd socket
    npm install
    ```

    ## Configuracio de la base de dades en SQL Server

    1. Crear la base de dades

    - Obre la teva eina d'administració (per exemple, SQL Server Management Studio).

    - Crea una nova base de dades, per exemple, ChatDB.

    2. Executar scripts SQL

    - En la carpeta database es troba el setup.sql, executa'l per crear les taules i dades necessesàries

    3. Configuració de les credencials de conexió

    - Anota el nom del servidor, el nom de la base de dades (ChatDB en aquest exemple), l'usuari i la contrasenya. Aquestes dades s'utilitzaran en la configuració de les variables d'entorn

    ## Configuració de les variables d'entorn (.env)

    Per mantenir les teves credencials segures i permetre que cada usuari configuri el seu propi fitxer .env, es recomana el següent:

    1. **Fitxer d'exemple**

       Al directori del backend, crea (o utilitza) un fitxer anomenat .env.example que contingui les variables d'entorn necessàries sense valors sensibles. Per exemple:

       ```bash
       # .env.example

       # Configuració de SQL Server, diferent depenent de la teva eina
       DB_SERVER=el-teu-servidor-sql-server
       DB_USER=el-teu-usuari
       DB_PASSWORD=el-teu-password
       DB_NAME=el-nom-de-la-teva-base-de-dades
       DB_PORT=el-teu-port-base-de-dades
       PORT=el-port-del-servidor-express 3100 en aquest cas
       SECRET_KEY=la-teva-clau-secreta
       SECRET_REFRESH_KEY=la-teva-clau-secreta-refresh
       ```

    2. **Crear el teu propi fitxer .env**

       Cada usuari haurà de copiar aquest fitxer d'exmple i
       assignarli els seus propis valors. Executa:

       ```bash
       cp .env.example .env
       ```

       A continuació, obre el fitxer .env amb el teu editor de text i substitueix els valors pels corresponents a la teva configuració local.

       **Important**: No afegeixis el fitxer .env al repositori per evitar exposar credencials sensibles. Assegura't que el teu fitxer .gitignore inclogui la línia .env.

    ## Execució del Backend i Frontend

    1.  **Executar el Backend**

        1. Obre una terminal i ves al directori backend:

           ```bash
              cd backend
           ```

        2. Assegura't que el fitxer .env estigui configurat correctament.

        3. Inicia el servidor:

           ```bash
              npm run devStart
           ```

           o

           ```bash
            npm start
           ```

        El servidor s'executarà (per defecte al port 3100 o al que hagis definit en el teu .env).

    2.  **Executar el Frontend**

        1.  Obre un altra terminal i dintre del projecte executa:

            ```bash
               ng serve
            ```

            L'aplicació s'executarà normalment a http://localhost:4200/. Si desitges utilitzar un altre port o configuració, consulta la documentació d'Angular CLI.

    3.  **Executar el Socket**

        1. Obre un altra terminal i ves al directori socket

           ```bash
              cd socket
           ```

        2. Inicia el servidor

           ```bash
              npm run devStart
           ```

           o

           ```bash
            npm start
           ```

    ## Notes addicionals

    - **Socket.io:**
      La integració de Socket.io es configura tant al backend com al frontend. Assegura't que la URL i el port configurats al frontend per connectar-se amb el servidor Socket.io coincideixin amb els del backend.

    - **Errors comuns:**

      - Verifica que el servidor SQL estigui en funcionament i que les credencials al .env siguin correctes.

      - Assegura't que no hi hagi conflictes de ports entre el frontend, el backend i el socket, per defecte el frontend serà **4200**, el backend **3100** i el socket **3500**

- **Actualitzacions de dependències**

  - Sempre és una bona idea actualitzar les dependències amb:

    ```bash
          npm update
    ```

## Autenticació

- L'aplicació utilitza autenticació basada en JWT (JSON Web Tokens):

  - Registre: L'usuari proporciona nom d'usuari, correu electrònic i contrasenya.

  - Login: L'usuari proporciona credencials i rep un access token i un refresh token.

  - Autenticació de peticions: Cada petició a un endpoint protegit ha d'incloure l'access token a la capçalera Authorization.
  - Renovació del token: Quan l'access token caduca, l'usuari pot utilitzar el refresh token per obtenir un nou access token.

  El middleware authenticateToken s'encarrega de verificar la validesa dels tokens en cada petició protegida.

## Suport

Si tens algun dubte o trobes algun error, obre un issue al repositori per porder ajudar-te
