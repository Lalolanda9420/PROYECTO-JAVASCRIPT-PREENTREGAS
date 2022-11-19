function ConvertToFloat(value){
  return value?parseFloat(value):0; 
}

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
//Intento de calendario para seleccion de fechas con precios por dia//
  async function InitFlyDatePicker(event){
    if(!self.FlyDatePicker){
      let valuesPerDay = await GetEventsPromise(GetValues);
      console.log("antes de crear el objeto FlyDatePicker")
      self.FlyDatePicker = new FlyDatePicker(event.target.id, valuesPerDay)
      console.log("despues de crear el objeto FlyDatePicker")
    }
  }

  async function GetValues(resolve)
  {
    
    setTimeout(()=>{
        resolve(
          [
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
            }]
        );
      }, 1000)
 
  }
  
  async function GetEventsPromise(eventsGetter)
  {
      return new Promise((resolve, reject) => 
      {
        eventsGetter(resolve);
      })
  };

  //eventos
  document
  .getElementById("flyDatePicker")
  .addEventListener("focus", InitFlyDatePicker);

};

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
      // let dataPrint = document.createElement('div')
  
      //   dataPrint.innerHTML += `
      //     <div class="container-data row">
      //       <div class="col s4">
      //         <h6>${calc.Destino}</h6>
      //       </div>
      //       <div class="col s4">
      //         <h6>${calc.Presupuesto}</h6>
      //       </div>
      //       <div class="col s4">
      //         <h6 id="balance"><strong>${calc.Balance}</strong></h6> 
      //       </div>
      //     </div>
      //   `
      // Result.appendChild(dataPrint)
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

    //evento
    BtnCalc.addEventListener('submit', Calculate);
    BtnVerUsuario.addEventListener('click', ShowUser);

  })(document);

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

  (async(id, dayCosts)=>{
    mobiscroll.datepicker(`#${id}`, {
      select: 'range',
      selectMultiple: true,
      labels: [...dayCosts],
      onClose: SetInterval
    });
    
  })(id, dayCosts);
}
//Carrito de compras v1.0 (Al hacer click en carrito, se abre ventana con los datos cargados en el formulario, esta permite borrar presupuesto si se desea)//
const ShoppingCart = new (function (document){

  let image = document.getElementById("shopping-cart-icon");
  this.VacationList = [];
  this.CalcList = [];
  this.Modal;

  const self = this;

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

  this.RemoveCalc = calc => {
    this.CalcList = this.CalcList.filter(c => c.Id!=calc);
  }

  function GetCalcId(article) {
    return `${article.Destino}${article.Presupuesto}${article.Balance}`;
  }

  function Modal(id){
    
    this.ModalHtml;
    this.ModalObject;
    const selfModal = this;

    this.Add = article => {
      this.ModalHtml.querySelector("#products").innerHTML += `<div class="product" id="${article.Id}">
                                      <span>Destino: ${article.Destino}</span>
                                      <span>Presupuesto: ${article.Presupuesto}</span>
                                      <span>Balance: ${article.Balance}</span>
                                      <i class="fa fa-trash" id="delete-${article.Id}" data-id="${article.Id}"></i>
                                    </div>`
      
      this.ModalHtml.querySelector(`#delete-${article.Id}`).addEventListener("click", Remove);
    }

    this.Remove = id => {
      self.RemoveCalc(id)
      this.ModalHtml.querySelector(`#${id}`).remove()
    
    }

    this.Open = () =>{
      this.ModalObject.show();
    }

    function Remove(e){
      selfModal.Remove(e.target.attributes['data-id'].value)
    }

    (async (document)=>{
      selfModal.ModalHtml = document.getElementById(id);
      selfModal.ModalObject = new bootstrap.Modal(selfModal.ModalHtml);
    })(document)

  }

  function OpenModal(e){
    self.ShowCart();
    e.target.id
  }

  image.addEventListener("click", OpenModal);

})(document);




















































  
  


