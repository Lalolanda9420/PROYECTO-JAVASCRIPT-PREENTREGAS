function ConvertToFloat(value){
  return value?parseFloat(value):0; 
}

//OBJETO PARA LA OBTENCIÓN DE LOS DATOS INGRESADOS POR EL USUARIO.
const InputDataVacation = function (document){
  const Destino = document.getElementById('destino');
  const Presupuesto = document.getElementById('presupuesto');
  const Transporte = document.getElementById('transporte');
  const Alojamiento = document.getElementById('alojamiento');
  const Comida = document.getElementById('comida');
  this.FlyDatePicker; 

  const self = this;

  this.GetValues =  () =>{
    return {Destino: Destino.value,
            Presupuesto:ConvertToFloat(Presupuesto.value),
            Transporte:ConvertToFloat(Transporte.value),
            Alojamiento:ConvertToFloat(Alojamiento.value),
            Comida:ConvertToFloat(Comida.value),
            Vuelo:this.FlyDatePicker.GetCost()
          }
  }

  async function InitFlyDatePicker(event){
    if(!self.FlyDatePicker){
      let valuesPerDay = await GetEventsPromise(GetValues);
      //PARSEO DEL JSON OBTENIDO POR EL SIMULADOR DE LA API.
      valuesPerDay = JSON.parse(valuesPerDay)
      valuesPerDay = valuesPerDay.map(d => {return {start:new Date(d.start), end:new Date(d.start), text:d.text, color:d.color}})
      self.FlyDatePicker = new FlyDatePicker(event.target.id, valuesPerDay)
    }
  }

  function GetValues(resolve)
  {
    
    setTimeout(()=>{
        resolve(//SERIALIZO OBJETO JSON
          JSON.stringify([
            {
              start: new Date(2022, 11, 5),
              end: new Date(2022, 11, 5),
              text: '$5000',
              color: 'green'
            }, 
            {
              start: new Date(2022, 11, 23),
              end: new Date(2022, 11, 24),
              text: '$14000',
              color: 'red'
            },
            {
              start: new Date(2022, 11, 12),
              end: new Date(2022, 11, 12),
              text: '$14000',
              color: 'red'
            },
            {
              start: new Date(2022, 11, 11),
              end: new Date(2022, 11, 11),
              text: '$5000',
              color: 'green'
            },
            {
              start: new Date(2022, 11, 27),
              end: new Date(2022, 11, 27),
              text: '$14000',
              color: 'red'
            }])
        );
      }, 1000)
 
  }
  
  //ENVUELVO CÓDIGO ASÍNCRONO EN UNA PROMESA PARA FORZAR EJECUCIÓN SÍNCRONA MEDIANTE ASYNC/AWAIT.
  //EL CÓDIGO ASÍNCRONO ES EL CALLBACK eventsGetter
  async function GetEventsPromise(eventsGetter)
  {
      return new Promise((resolve, reject) => 
      {
        eventsGetter(resolve);
      })
  };

  //MANEJO DEL EVENTO FOCUS DEL CAMPO FECHA.
  document
  .getElementById("flyDatePicker")
  .addEventListener("focus", InitFlyDatePicker);

};

//VacationCalc SE CREA EN LA CARGA INICIAL DEL JS.
const VacationCalc = new ( function(document){
  
    const BtnCalc = document.getElementById('vacationCalc');
    const BtnVerUsuario = document.getElementById('ver_usuario');
    const Result = document.getElementById('result');
    const Usuario = prompt("Escriba su nombre y apellido: ");
    const GetterValues = new InputDataVacation(document);
    
    const self = this;

    this.Calculate = () => {
        let data = GetterValues.GetValues();
        ShoppingCart.AddVacation(data);
        
        let expenses = data.Alojamiento + 
                        data.Transporte + 
                        data.Comida + 
                        data.Vuelo;

        let calc = {Destino:data.Destino,
                    Presupuesto:data.Presupuesto,
                    Balance:data.Presupuesto - expenses}
        
        ShoppingCart.AddCalc(calc)
        UI(calc);
    }
    
    function UI(calc){
      
      let dataPrint = document.createElement('div')
  
         dataPrint.innerHTML += `
           <div class="container-data row">
             <div class="col s4">
               <h6>${calc.Destino}</h6>
             </div>
             <div class="col s4">
               <h6>${calc.Presupuesto}</h6>
             </div>
             <div class="col s4">
               <h6 id="balance"><strong>${calc.Balance}</strong></h6> 
             </div>
           </div>
         `
       Result.appendChild(dataPrint)
      BtnCalc.reset();
    }

    function Calculate(e){
        e.preventDefault();
        self.Calculate()

    }

    function ShowUser(e){
      e.preventDefault();
      alert(Usuario);
    }

    //eventos
    BtnCalc.addEventListener('submit', Calculate);
    BtnVerUsuario.addEventListener('click', ShowUser);

  })(document);

//"CLASE" FlyDatePicker
const FlyDatePicker = function (id, dayCosts) {
  const dayCostList = Array.from(dayCosts);//
  const selectedInterval = {init:null, fin:null}
  const inputDate = document.getElementById(id);
  const self = this;
  const VALOR_DEFECTO_VUELO = 4000;

  this.GetCost = () => {
    let costInit = dayCostList.find(d => SameDay(d.start,selectedInterval.init));
    costInit = costInit ? GetCostValue(costInit.text) : VALOR_DEFECTO_VUELO;
    let costFin = dayCostList.find(d => SameDay(d.start,selectedInterval.fin));
    costFin = costFin ? GetCostValue(costFin.text):VALOR_DEFECTO_VUELO;

    return this.IsSameDay() ? costInit : (costInit + costFin) 
  }

  this.IsSameDay = () =>{
    return SameDay(selectedInterval.init,selectedInterval.fin);
  }

  this.Reset = () =>{
    selectedInterval.init = null;
    selectedInterval.fin = null;
    inputDate.text = "";
  }

  //MANEJADOR DEL EVENTO CERRAR DEL DatePicker
  function SetInterval(event, inst){
    
    selectedInterval.init = event.value[0];
    selectedInterval.fin = event.value[1];
    
  }
  
  function GetCostValue(value) {
    return ConvertToFloat(value.replace('$',''));
  } 

  function SameDay(d1, d2){
    let date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    let date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate())
    return date1.getTime() == date2.getTime();
  }

  //CREACIÓN DEL DATEPICKER
  (async(id, dayCosts)=>{
    mobiscroll.datepicker(`#${id}`, {
      select: 'range',
      selectMultiple: true,
      labels: [...dayCosts],
      onClose: SetInterval
    });
    
  })(id, dayCosts);
}

//ShoppingCart SE CREA EN LA CARGA INICIAL DEL JS.
const ShoppingCart = new (function (document){

  let image = document.getElementById("shopping-cart-icon");
  this.VacationList = [];
  this.CalcList = [];
  this.Modal;

  const self = this;//CONTEXTO DE ShoppingCart

  this.ShowCart = () => {
    if(!this.Modal)
      this.Modal = new Modal("shopping-cart-container");
    
    this.Modal.Open()
  }

  this.AddVacation = vacation =>{
    this.VacationList.push(vacation);
  }

  this.AddCalc = calc =>{
    if(!this.Modal)
      this.Modal = new Modal("shopping-cart-container");

    calc.Id = GetCalcId(calc);
    this.CalcList.push(calc);
    this.Modal.Add(calc);
  }

  //FILTRO LOS DISTINTOS DEL ID RESPECTIVO.
  this.RemoveCalc = calc => {
    this.CalcList = this.CalcList.filter(c => c.Id!=calc);
  }

  //CREACIÓN DEL ID DEL PRESUPUESTO
  function GetCalcId(article) {
    return `${article.Destino}${article.Presupuesto}${article.Balance}`;
  }

  //MODAL DEL CARRITO, SE VISUALIZAN LOS PRESUPUESTOS CARGADOS.
  function Modal(id){
    
    this.ModalHtml;
    this.ModalObject;
    const selfModal = this; //CONTEXTO DE Modal

    this.Add = article => {
      let calc = document.createElement("div");
      calc.setAttribute("id",`${article.Id}`);
      calc.setAttribute("class","product");
      calc.innerHTML = `<span>Destino: ${article.Destino}</span>
                        <span>Presupuesto: ${article.Presupuesto}</span>
                        <span>Balance: ${article.Balance}</span>
                        <i class="fa fa-trash" id="delete-${article.Id}" data-id="${article.Id}"></i>`
      this.ModalHtml.querySelector("#products").appendChild(calc);
      //SETEO DEL EVENTO CLICK DEL TACHITO DEL PRESUPUESTO
      this.ModalHtml.querySelector(`#delete-${article.Id}`).addEventListener("click", Remove);
    }

    this.Remove = id => {
      self.RemoveCalc(id)
      this.ModalHtml.querySelector(`#${id}`).remove()
    }

    //ABRO LA MODAL, MÉTODO DE BOOTSTRAP.
    this.Open = () =>{
      this.ModalObject.show();
    }

    //MANEJADOR DEL EVENTO CLICK DEL TACHITO DEL PRESUPUESTO
    function Remove(e){
      selfModal.Remove(e.target.attributes['data-id'].value)
    }

    //FUNCIÓN AUTOINVOCADA QUE SETEA PROPIEDADES DEL OBJETO MODAL
    (async (document)=>{
      selfModal.ModalHtml = document.getElementById(id);
      selfModal.ModalObject = new bootstrap.Modal(selfModal.ModalHtml);
    })(document)

  }

  //MANEJADOR DE EVENTO CLICK DEL CARRITO
  function OpenModal(e){
    self.ShowCart();
    e.target.id
  }

  //SETEO DE EVENTO CLICK DEL CARRITO
  image.addEventListener("click", OpenModal);

})(document);
