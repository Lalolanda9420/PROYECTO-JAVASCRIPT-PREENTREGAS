


//código nuevo V2

const InputDataVacation = new ( function (document){
  this.Destino = document.getElementById('destino');
  this.Presupuesto = document.getElementById('presupuesto');
  this.Transporte = document.getElementById('transporte');
  this.Alojamiento = document.getElementById('alojamiento');
  this.Comida = document.getElementById('comida');

  this.GetValues =  () =>{
    return {Destino:this.Destino.value,
            Presupuesto:ConvertToFloat(this.Presupuesto.value),
            Transporte:ConvertToFloat(this.Transporte.value),
            Alojamiento:ConvertToFloat(this.Alojamiento.value),
            Comida:ConvertToFloat(this.Comida.value)}
  }

  function ConvertToFloat(value){
    return value?parseFloat(value):0; 
  }

})(document);

const VacationCalc = new ( function(document){
  
    this.VacationList = [];
    this.CalcList = [];
    const BtnCalc = document.getElementById('vacationCalc');
    const BtnVerUsuario = document.getElementById('ver_usuario');
    const Result = document.getElementById('result');
    const Usuario = prompt("Escriba su nombre y apellido: ");
    let self = this;

    this.Calculate = data => {
        this.VacationList.push(data);
        let expenses = data.Alojamiento + data.Transporte + data.Comida;
        let calc = {Destino:data.Destino,
                    Presupuesto:data.Presupuesto,
                    Balance:data.Presupuesto - expenses}
        this.CalcList.push(calc);
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
        self.Calculate(InputDataVacation.GetValues())
    }

    function ShowUser(e){
      e.preventDefault();
      alert(Usuario);
    }

    //eventos
    BtnCalc.addEventListener('submit', Calculate);
    BtnVerUsuario.addEventListener('click', ShowUser);

})(document);