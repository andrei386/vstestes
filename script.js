/* ============================================================
   LOGIN LAMP — script.js
   ============================================================ */


/* ------------------------------------------------------------
   CONFIGURAÇÃO
   Duração total da animação do pêndulo em milissegundos.
   Deve corresponder ao valor de --cord-duration no CSS.
   ------------------------------------------------------------ */
const CORD_DURATION_MS = 2800;


/* ------------------------------------------------------------
   REFERÊNCIAS AO DOM
   ------------------------------------------------------------ */
const lamp      = document.getElementById('lamp');
const cord      = document.getElementById('cord');
const loginForm = document.getElementById('loginForm');
const lightGlow = document.getElementById('lightGlow');


/* ------------------------------------------------------------
   POSICIONAMENTO DO GLOW
   Calcula as coordenadas reais do abajur na tela e move o
   elemento .light-glow para ficar centralizado sobre ele.
   Chamado na carga e sempre que a janela é redimensionada,
   garantindo que o efeito funcione em qualquer tamanho de tela.
   ------------------------------------------------------------ */
function positionGlow() {
  const lampTop = lamp.querySelector('.lamp-top');
  if (!lampTop) return;

  const rect = lampTop.getBoundingClientRect();
  lightGlow.style.left = `${rect.left + rect.width  / 2}px`;
  lightGlow.style.top  = `${rect.top  + rect.height / 2}px`;
}


/* ------------------------------------------------------------
   ANIMAÇÃO DO CORDÃO
   Usa a Web Animations API para controlar o movimento de pêndulo
   diretamente via JavaScript, sem classes CSS.

   Por que não usar CSS animation/transition?
   O CSS não consegue resolver conflitos quando hover e animação
   definem transform no mesmo elemento ao mesmo tempo — o resultado
   é um salto brusco. Com a WAAPI o JS tem controle exclusivo:
   cancela qualquer animação anterior e inicia uma nova do zero.

   Os ângulos seguem a física de um pêndulo amortecido:
   cada meio ciclo perde aproximadamente 52% da amplitude anterior.
   O easing 'ease-in-out' por segmento simula a desaceleração
   natural no pico e a aceleração ao cruzar o ponto central.
   ------------------------------------------------------------ */

/* Guarda a animação em curso para poder cancelá-la se necessário */
let cordAnimation = null;

function animateCord() {
  /* Cancela a animação anterior antes de iniciar uma nova */
  if (cordAnimation) {
    cordAnimation.cancel();
    cordAnimation = null;
  }

  /* Sequência de ângulos do pêndulo amortecido (em graus) */
  const angles = [0, 23, -12, 6.5, -3.4, 1.8, -0.9, 0.4, -0.15, 0];

  /* Transforma os ângulos em keyframes com easing individual por segmento */
  const keyframes = angles.map((angle, i) => ({
    transform: `rotate(${angle}deg)`,
    easing: i < angles.length - 1 ? 'ease-in-out' : 'ease-out',
  }));

  cordAnimation = cord.animate(keyframes, {
    duration: CORD_DURATION_MS,
    fill: 'none',    /* ao terminar, o elemento volta exatamente ao estado original */
    iterations: 1,
  });

  /* Limpa a referência quando a animação termina normalmente */
  cordAnimation.onfinish = () => { cordAnimation = null; };
}


/* ------------------------------------------------------------
   ALTERNÂNCIA DE LUZ
   Adiciona ou remove a classe "light" do body, o que ativa
   todos os estilos visuais do estado aceso via CSS.
   Também atualiza o atributo aria-hidden do formulário.
   ------------------------------------------------------------ */
function toggleLight() {
  positionGlow();

  document.body.classList.toggle('light');

  /* Informa leitores de tela se o formulário está visível */
  const isLight = document.body.classList.contains('light');
  loginForm.setAttribute('aria-hidden', String(!isLight));

  animateCord();
}


/* ------------------------------------------------------------
   EVENTOS DA LÂMPADA
   Clique e teclado (Enter / Espaço) para acessibilidade.
   ------------------------------------------------------------ */
lamp.addEventListener('click', toggleLight);

lamp.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleLight();
  }
});


/* ------------------------------------------------------------
   EVENTO DO BOTÃO DE LOGIN
   Valida se os campos estão preenchidos antes de prosseguir.
   Se vazios, exibe um feedback visual de shake no formulário.
   ------------------------------------------------------------ */
document.getElementById('btnLogin').addEventListener('click', () => {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    /* Reinicia a animação de shake mesmo se já estiver rodando */
    loginForm.classList.remove('shake');
    void loginForm.offsetWidth;  /* força reflow para reiniciar o keyframe */
    loginForm.classList.add('shake');
    return;
  }

  /* Ponto de integração: substitua pelo seu método de autenticação */
  alert(`Login enviado para: ${email}`);
});

/* Remove a classe shake ao fim da animação para não acumular estado */
loginForm.addEventListener('animationend', () => {
  loginForm.classList.remove('shake');
});


/* ------------------------------------------------------------
   KEYFRAMES DO SHAKE (injetados dinamicamente)
   Mantidos em JS para não poluir o CSS com um efeito pontual.
   ------------------------------------------------------------ */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-5px); }
    40%       { transform: translateX(5px); }
    60%       { transform: translateX(-3px); }
    80%       { transform: translateX(3px); }
  }
  .login-form.shake {
    animation: shake 0.4s ease;
  }
`;
document.head.appendChild(shakeStyle);


/* ------------------------------------------------------------
   INICIALIZAÇÃO
   Posiciona o glow ao carregar e recalcula ao redimensionar.
   ------------------------------------------------------------ */
positionGlow();
window.addEventListener('resize', positionGlow);
