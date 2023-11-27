// src/app/path-display/path-display.component.ts
import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.css']
})
export class AreasComponent implements OnInit {

  pathItems: string[] = [];
  selectedCountryName = null;
  selectedCountryNameForDisplay = null;
  selectedAreaName = null;
  selectedAreaNameForDisplay = null;
  selectedSectorName = null;
  selectedSectorNameForDisplay = null;

  title = 'Sun Beta';

  where = null

  countries =[]
  areas = []

  inputText = ''
  filtered_areas = []
  filtered_countries = []
  selectedCountry = null
  selectedArea = null
  tiny = false;
  shade_data = {}
  sort_type = 'a_to_z'

  nav_open=false;

  constructor(private route: ActivatedRoute,private renderer: Renderer2) { }

  ngOnInit(): void {

    if (window.screen.width < 400) { 
      this.tiny = true;
    }



    this.route.url.subscribe(segments => {
      var pathItems = segments.map(segment => segment.path)
      if (pathItems.length>0){
        if (['about','how-it-works','contact'].includes(pathItems[0].toLowerCase())){
          this.where = pathItems[0]
        } else {
          this.selectedCountryName = pathItems[0]
          this.selectedCountryNameForDisplay = this.capitalizeFirstLetterOfWords(this.selectedCountryName)
          if (pathItems.length>1){
            this.selectedAreaName = pathItems[1]
            if (pathItems.length>2){
              this.selectedSectorName = pathItems[2]
            }
            this.getShadeData()
          } else {
            this.getAreaList()
          }
        }
      } else {
        this.getCountryList()
      }
    });

  }

  capitalizeFirstLetterOfWords(inputString: string): string {
    return inputString
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  toggle_nav(){
    this.nav_open = !this.nav_open
  }

  openUrl(url){
    window.location.href = url
  }
  getCountryList(){
    var url = `./assets/countries/countries_list.json`
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            data.sort((a, b) => a.name.localeCompare(b.name))
            this.countries = data;
            this.filtered_countries = this.countries
          });
  }

  getAreaList(){

    var n_country_name = this.normName(this.selectedCountryName)
    var url = `./assets/countries/${n_country_name}/areas_list.json`
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        data.sort((a, b) => a.name.localeCompare(b.name))
        this.areas = data;
        this.filtered_areas = this.areas
      });
  }

  getShadeData(){
    if (this.selectedSectorName == null){
      const style = this.renderer.createElement('style');
      const css = '.set_height { height:30px }';
      this.renderer.appendChild(style, this.renderer.createText(css));
      this.renderer.appendChild(document.head, style);
    }
    
    var n_country_name = this.normName(this.selectedCountryName)
    var n_area_name = this.normName(this.selectedAreaName)
    var url = `./assets/countries/${n_country_name}/${n_area_name}.json`
    fetch(url)
    .then((res) => res.json())
    .then((shadeData) => {
      this.shade_data = shadeData;
      this.selectedAreaNameForDisplay = shadeData['name']
      const currentDate = new Date();
      const formattedDay = currentDate.toISOString().split("T")[0];
      (<HTMLInputElement>document.getElementById("datePicker")).value = formattedDay;
      this.dateChanged()
    });
  }

  getFilteredCountries(){
    this.inputText = (<HTMLInputElement>document.getElementById("countries_input")).value
    this.filtered_countries = []
    for (var country of this.countries){
      if (this.isInArea(country)){
        this.filtered_countries.push(country)
      }
    }
  }

  getFilteredAreas(){
    this.inputText = (<HTMLInputElement>document.getElementById("areas_input")).value
    this.filtered_areas = []
    for (var area of this.areas){
      if (this.isInArea(area)){
        this.filtered_areas.push(area)
      }
    }
  }

  isInArea(area){

    var str = this.inputText.toLowerCase()
    if (str == ''){
      return true
    }

    if (area.name.toLowerCase().includes(str)){
      return true
    }

    if (area.localName.toLowerCase().includes(str)){
      return true
    }

    return false
  }

  changeDay(n){

    const datePicker = document.getElementById("datePicker") as HTMLInputElement;
    const currentDate = new Date(datePicker.value);
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + n);
    const formattedNextDay = nextDay.toISOString().split("T")[0];
    datePicker.value = formattedNextDay;
    this.dateChanged()

  }

  changeMonth(n){

    const datePicker = document.getElementById("datePicker") as HTMLInputElement;
    const currentDate = new Date(datePicker.value);
    const nextDay = new Date(currentDate);
    nextDay.setMonth(currentDate.getMonth() + n);
    const formattedNextDay = nextDay.toISOString().split("T")[0];
    datePicker.value = formattedNextDay;
    this.dateChanged()

  }

  normName(s: string): string {
      s = s.trim();
      s = s.replace("'","")
      s = s.replace("(","")
      s = s.replace(")","")
      s = s.toLowerCase();
      s = s.split(' ').join('_');
      return s;
  }


  sortBy(v){
      function addClass(eId,name){
        document.getElementById(eId).classList.add(name)
      }
      function removeClass(eId,name){
        document.getElementById(eId).classList.remove(name)
      }

      removeClass('sort_by_shade_arrow',"sort-by-down")
      removeClass('sort_by_name_arrow',"sort-by-down")
      removeClass('sort_by_shade_arrow',"sort-by-up")
      removeClass('sort_by_name_arrow',"sort-by-up")
      removeClass('sort_by_name_th',"bold")
      removeClass('sort_by_shade_th',"bold")

      if (v == 'sector_name'){

        addClass('sort_by_name_th','bold')
        addClass('sort_by_shade_arrow','sort-by-down')
        addClass('sort_by_shade_arrow','sort-by-up')

        if (this.sort_type=='a_to_z'){
           
            this.sort_type = 'z_to_a'
            addClass('sort_by_name_arrow',"sort-by-up")
        } else {
            this.sort_type = 'a_to_z'
            addClass('sort_by_name_arrow',"sort-by-down")
        }
      } else if (v == 'shade'){
        addClass('sort_by_shade_th','bold')
        addClass('sort_by_name_arrow','sort-by-down')
        addClass('sort_by_name_arrow','sort-by-up')
        if (this.sort_type=='shade'){
          addClass('sort_by_shade_arrow',"sort-by-up")
            this.sort_type = 'sun'
        } else {
            this.sort_type = 'shade'
            addClass('sort_by_shade_arrow',"sort-by-down")
        }
      } 
      this.dateChanged()
    }

   getSortedSectorsKeys(day_shade_data){
          var sortedKeys;
          if (this.sort_type == 'shade'){
              sortedKeys = Object.keys(day_shade_data['sectors']).sort(function(a, b) {
                  return day_shade_data['sectors'][b].total_shade_hours - day_shade_data['sectors'][a].total_shade_hours;
              });
          } else if (this.sort_type == 'sun'){
              sortedKeys = Object.keys(day_shade_data['sectors']).sort(function(a, b) {
                  return day_shade_data['sectors'][a].total_shade_hours - day_shade_data['sectors'][b].total_shade_hours;
              });
          } else if (this.sort_type == 'a_to_z'){
              sortedKeys = Object.keys(day_shade_data['sectors']).sort()
          } else if (this.sort_type == 'z_to_a'){
              sortedKeys = Object.keys(day_shade_data['sectors']).sort().reverse();
          }
          return sortedKeys
        }


    getSectorTableRow(sector_name,day_shade_data){
        function toPoint(t,h){
          return `${t.toFixed(2)},${(1-h).toFixed(2)} `
        }

            var all_times = day_shade_data['times']
            var min_hour = Math.floor(all_times[0])
            var max_hour =  Math.ceil(all_times[all_times.length-1])


            var sector_shade_data = day_shade_data['sectors'][sector_name]['sector_shade_times']
            var times = sector_shade_data.map(point => point[0]);
            var shades = sector_shade_data.map(point => point[1]);
            
            var points_str = toPoint(max_hour,0) + toPoint(min_hour,0)

            if (min_hour < all_times[0] && shades[0]>0){
             points_str += toPoint(min_hour,shades[0])
            }

            points_str += toPoint(times[0],shades[0])

            

            for (var i = 0; i < shades.length; i++) {

                var dt1 = times[i+1] - times[i] 
                var dt2 = times[i] - times[i-1] 

                if (i>0){
                    if (dt1 > 0.25 || dt2 > 0.25) {
                      points_str += toPoint(times[i] - 0.04,shades[i - 1])
                    }
                }
                points_str += toPoint(times[i] + 0.0,shades[i])
            }
            points_str += toPoint(max_hour,shades[shades.length - 1])


            var dh = 2;
            if (this.selectedSectorName){
              dh = 1;
            }

            var polylines=''

            for (var h = min_hour + dh; h < max_hour; h += dh) {
              polylines+=`<polyline points="${h},1 ${h},0" fill="none" stroke="white" stroke-width="0.02" stroke-dasharray="0.1"/>`
            }

            var svg = ` 
            <svg viewBox="${min_hour-1} 0 ${max_hour - min_hour+2} 1">
              <polygon points='${max_hour},1 ${min_hour},1 ${min_hour},0 ${max_hour},0'/>
              <polygon points='${points_str}'/>
              ${polylines}
            </svg>
            `

            if (this.selectedSectorName == null){
              var url = `./${this.selectedCountryName}/${this.selectedAreaName}/${sector_name}`
              return `<tr><td class="set_height"><a href="${url}">${sector_name}</a></td><td class="set_height"><a href="${url}">${svg}</a></td></tr>`
            } else {
              return `<tr><td>${svg}</td></tr>`
            }
            
    }

    setHeaderSvg(day_shade_data){
      var all_times = day_shade_data['times']
        var min_hour = Math.floor(all_times[0])
        var max_hour =  Math.ceil(all_times[all_times.length-1])

      var fontSize = 0.5
      var dh = 2;
      if (this.selectedSectorName){
        dh = 1;
        if (window.screen.width > 500){
          fontSize = 0.3
        }
      }
      var svg_texts = ''
        for (var h = min_hour; h < max_hour+1; h += dh) {
          svg_texts+=`<text font-size="${fontSize}" text-anchor="middle" x="${h}" y="0.9">
               ${h}
            </text>`
        }
        var th_svg = `<svg viewbox="${min_hour-1} 0 ${max_hour-min_hour+2} 1">
            ${svg_texts}
        </svg>`


        document.getElementById("time_line").innerHTML = th_svg
    }

    setSectorsTable(day_shade_data){
        this.setHeaderSvg(day_shade_data)

        var table_rows = ''
        var sortedKeys = this.getSortedSectorsKeys(day_shade_data)


        for (var sector_name of sortedKeys){
          if (this.selectedSectorName){
            if (this.normName(this.selectedSectorName) == this.normName(sector_name)){
              this.selectedSectorNameForDisplay = sector_name
              table_rows += this.getSectorTableRow(sector_name,day_shade_data)
            }
          } else {
            table_rows += this.getSectorTableRow(sector_name,day_shade_data)
          }
              
        }
        
        document.getElementById("tbody_el").innerHTML = table_rows
    }

    setSectorsSvg(day_shade_data){

    }

    dateChanged(){

        var selectedDateValue = (<HTMLInputElement>document.getElementById("datePicker")).value;
        var selectedDate = new Date(selectedDateValue);
        var month = selectedDate.getMonth() + 1; // Month is 0-based, so add 1
        var dayOfMonth = selectedDate.getDate();
        var day_shade_data = this.shade_data[month][dayOfMonth]
        
        this.setSectorsTable(day_shade_data) 
                
    } 

    scroll(eid) {
      document.getElementById(eid).scrollIntoView();
      }



}
