import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { getStorage, ref as storageRef, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

const storage = getStorage(app);
storage.maxUploadRetryTime = 600000; // 10 minutos
storage.maxOperationRetryTime = 600000; // 10 minutos

function uploadImage(file, path) {
  const fileRef = storageRef(storage, path);
  const uploadTask = uploadBytesResumable(fileRef, file);

  uploadTask.on('state_changed', 
    (snapshot) => {
      // Progresso do upload
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
    }, 
    (error) => {
      // Tratamento de erros
      console.error('Erro ao fazer upload:', error);
    }, 
    () => {
      // Upload concluído com sucesso
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log('File available at', downloadURL);
      });
    }
  );
}

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCKyxMkJJo8I6Du_SrJSVJfh70Vz45Fq4I",
  authDomain: "limpeza-7ca82.firebaseapp.com",
  projectId: "limpeza-7ca82",
  storageBucket: "limpeza-7ca82.appspot.com",
  messagingSenderId: "513477458942",
  appId: "1:513477458942:web:4f8344d27b17c68be05eaf"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

// Função para fazer upload de imagem
function uploadImage(file, path) {
  const fileRef = storageRef(storage, path);
  return uploadBytes(fileRef, file).then((snapshot) => {
    return getDownloadURL(snapshot.ref);
  });
}

// Evento de submissão do formulário
document.getElementById('registroForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = document.getElementById('data').value;
  const local = document.getElementById('local').value;
  const fotoAntes = document.getElementById('fotoAntes').files[0];
  const fotoDepois = document.getElementById('fotoDepois').files[0];

  try {
    const fotoAntesURL = await uploadImage(fotoAntes, `fotosAntes/${data}_${local}`);
    const fotoDepoisURL = await uploadImage(fotoDepois, `fotosDepois/${data}_${local}`);

    await set(ref(database, 'registros/' + data), {
      data: data,
      local: local,
      fotoAntes: fotoAntesURL,
      fotoDepois: fotoDepoisURL
    });

    document.getElementById('mensagem').innerText = 'Registro salvo com sucesso!';
    consultarRegistros(); // Atualizar a lista de registros após salvar
  } catch (error) {
    document.getElementById('mensagem').innerText = 'Erro ao salvar registro: ' + error.message;
  }
});

// Função para consultar dados do Firebase
function consultarRegistros() {
  const dbRef = ref(getDatabase(app));

  get(child(dbRef, 'registros')).then((snapshot) => {
    if (snapshot.exists()) {
      const registros = snapshot.val();
      const registrosContainer = document.getElementById('registrosContainer');
      registrosContainer.innerHTML = ''; // Limpar conteúdo anterior

      for (const key in registros) {
        if (registros.hasOwnProperty(key)) {
          const registro = registros[key];
          const registroDiv = document.createElement('div');
          registroDiv.classList.add('registro');

          registroDiv.innerHTML = `
            <p><strong>Data:</strong> ${registro.data}</p>
            <p><strong>Local:</strong> ${registro.local}</p>
            <p><strong>Foto Antes:</strong> <img src="${registro.fotoAntes}" alt="Foto Antes" width="100"></p>
            <p><strong>Foto Depois:</strong> <img src="${registro.fotoDepois}" alt="Foto Depois" width="100"></p>
          `;

          registrosContainer.appendChild(registroDiv);
        }
      }
    } else {
      console.log("Nenhum registro encontrado.");
    }
  }).catch((error) => {
    console.error("Erro ao buscar registros: ", error);
  });
}

// Chamar a função para consultar registros ao carregar a página
document.addEventListener('DOMContentLoaded', consultarRegistros);
