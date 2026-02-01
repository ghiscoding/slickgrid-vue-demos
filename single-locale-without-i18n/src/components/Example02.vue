<script setup lang="ts">
import { ExcelExportService } from '@slickgrid-universal/excel-export';
import { TextExportService } from '@slickgrid-universal/text-export';
import {
  type Column,
  DelimiterType,
  Filters,
  type Formatter,
  Formatters,
  GridOption,
  GridStateChange,
  SlickgridVue,
  SlickgridVueInstance,
} from 'slickgrid-vue';
import { onBeforeMount, ref, type Ref } from 'vue';
import { localeFrench } from './locales/fr.js';

const NB_ITEMS = 1500;
const gridOptions = ref<GridOption>();
const columnDefinitions: Ref<Column[]> = ref([]);
const dataset = ref<any[]>([]);
const showSubTitle = ref(true);
let duplicateTitleHeaderCount = 1;
const excelExportService = new ExcelExportService();
const textExportService = new TextExportService();
let vueGrid!: SlickgridVueInstance;

const taskFormatter: Formatter = (_row, _cell, value) => {
  return value !== undefined ? `Titre ${value}` : '';
};

const exportBooleanFormatter: Formatter = (_row, _cell, value) => {
  return value ? 'Vrai' : 'Faux';
};

onBeforeMount(() => {
  defineGrid();

  // mock some data (different in each dataset)
  dataset.value = getData(NB_ITEMS);
});

/* Define grid Options and Columns */
function defineGrid() {
  columnDefinitions.value = [
     { id: 'title', name: 'Titre', field: 'id', sortable: true, minWidth: 100, filterable: true, formatter: taskFormatter, params: { useFormatterOuputToFilter: true } },
    { id: 'description', name: 'Description', field: 'description', filterable: true, sortable: true, minWidth: 80 },
    {
      id: 'duration', name: 'Durée (jours)', field: 'duration', sortable: true,
      formatter: Formatters.percentCompleteBar,
      minWidth: 100,
      filterable: true,
      filter: { model: Filters.compoundSlider, operator: '>=' }
    },
    {
      id: 'start', name: 'Début', field: 'start', minWidth: 100,
      formatter: Formatters.dateIso, outputType: 'dateIso', type: 'date', exportWithFormatter: true,
      filterable: true, filter: { model: Filters.compoundDate }
    },
    {
      id: 'finish', name: 'Fin', field: 'finish',
      formatter: Formatters.dateIso, outputType: 'dateIso', type: 'date', exportWithFormatter: true,
      minWidth: 100, filterable: true, filter: { model: Filters.compoundDate }
    },
    {
      id: 'completedBool', name: 'Complétée', field: 'completedBool', minWidth: 100,
      sortable: true,
      formatter: Formatters.checkmarkMaterial,
      exportCustomFormatter: exportBooleanFormatter,
      filterable: true,
      filter: {
        collection: [{ value: true, label: 'Vrai' }, { value: false, label: 'Faux' }],
        model: Filters.multipleSelect,
      }
    }
  ];

  gridOptions.value = {
    autoResize: {
      container: '#demo-container',
      rightPadding: 10
    },
    // use a Single Custom Locales set
    locale: 'fr', // this helps certain elements to know which locale to use, for example the Date Filter/Editor
    locales: localeFrench,
    enableAutoResize: true,
    enableExcelCopyBuffer: true,
    enableFiltering: true,
    checkboxSelector: {
      // you can toggle these 2 properties to show the "select all" checkbox in different location
      hideInFilterHeaderRow: false,
      hideInColumnTitleRow: true
    },
    enableCheckboxSelector: true,
    enableRowSelection: true,
    showCustomFooter: true, // display some metrics in the bottom custom footer
    customFooterOptions: {
      // optionally display some text on the left footer container
      // leftFooterText: 'custom text shown on left container',
      metricTexts: {
        // default text displayed in the metrics section on the right
        items: 'éléments',
        of: 'de',
        lastUpdate: 'dernière mise à jour',
      },
      dateFormat: 'YYYY-MM-DD, hh:mm a',
      hideTotalItemCount: false,
      hideLastUpdateTimestamp: false,
    },
    excelExportOptions: {
      // optionally pass a custom header to the Excel Sheet
      // a lot of the info can be found on Excel-Builder-Vanilla
      // https://ghiscoding.gitbook.io/excel-builder-vanilla/cookbook/fonts-and-colors
      customExcelHeader: (workbook, sheet) => {
        const stylesheet = workbook.getStyleSheet();
        const aFormatDefn = {
          'font': { 'size': 12, 'fontName': 'Calibri', 'bold': true, color: 'FF0000FF' }, // every color starts with FF, then regular HTML color
          'alignment': { 'wrapText': true }
        };
        const formatterId = stylesheet.createFormat(aFormatDefn);
        sheet.setRowInstructions(0, { height: 30 }); // change height of row 0

        // excel cells start with A1 which is upper left corner
        sheet.mergeCells('B1', 'D1');
        const cols = [];
        // push empty data on A1
        cols.push({ value: '' });
        // push data in B1 cell with metadata formatter
        cols.push({ value: 'Titre qui est suffisament long pour être coupé', metadata: { style: formatterId.id } });
        sheet.data.push(cols);
      }
    },
    gridMenu: {
      hideExportCsvCommand: false,           // false by default, so it's optional
      hideExportTextDelimitedCommand: false  // true by default, so if you want it, you will need to disable the flag
    },
    enableExcelExport: true,
    enableTextExport: true,
    textExportOptions: {
      // set at the grid option level, meaning all column will evaluate the Formatter (when it has a Formatter defined)
      exportWithFormatter: true,
      sanitizeDataExport: true
    },
    externalResources: [excelExportService, textExportService],
  };
}

function getData(count: number) {
  // mock a dataset
  const tmpData: any[] = [];
  for (let i = 0; i < count; i++) {
    const randomYear = 2000 + Math.floor(Math.random() * 10);
    const randomMonth = Math.floor(Math.random() * 11);
    const randomDay = Math.floor(Math.random() * 29);

    tmpData[i] = {
      id: i,
      description: i % 5 ? 'desc ' + i : '🚀🦄 español', // also add some random to test NULL field
      duration: Math.round(Math.random() * 100) + '',
      start: new Date(randomYear, randomMonth, randomDay),
      finish: new Date(randomYear, randomMonth + 1, randomDay),
      completedBool: i % 5 === 0 ? true : false,
      completed: i % 5 === 0 ? 'TRUE' : 'FALSE',
    };
  }
  return tmpData;
}

function dynamicallyAddTitleHeader() {
  // you can dynamically add your column to your column definitions
  // and then use the spread operator [...cols] OR slice to force Vue to review the changes
  const newCol = {
    id: `title${duplicateTitleHeaderCount++}`,
    field: 'id',
    name: 'Titre',
    formatter: taskFormatter,
    sortable: true,
    minWidth: 100,
    filterable: true,
    params: { useFormatterOuputToFilter: true },
  };
  columnDefinitions.value.push(newCol);
  columnDefinitions.value = columnDefinitions.value.slice(); // or use spread operator [...cols]

  // NOTE if you use an Extensions (Checkbox Selector, Row Detail, ...) that modifies the column definitions in any way
  // you MUST use "getAllColumnDefinitions()" from the GridService, using this will be ALL columns including the 1st column that is created internally
  // for example if you use the Checkbox Selector (row selection), you MUST use the code below
  /*
    const allColumns = vueGrid.gridService.getAllColumnDefinitions();
    allColumns.push(newCol);
    columnDefinitions.value = [...allColumns]; // (or use slice) reassign to column definitions for Vue to do dirty checking
    */
}

function exportToExcel() {
  excelExportService.exportToExcel({
    filename: 'Export',
    format: 'xlsx',
  });
}

function exportToFile(type = 'csv') {
  textExportService.exportToFile({
    delimiter: type === 'csv' ? DelimiterType.comma : DelimiterType.tab,
    filename: 'myExport',
    format: type === 'csv' ? 'csv' : 'txt',
  });
}

/** Dispatched event of a Grid State Changed event */
function gridStateChanged(gridStateChanges: GridStateChange) {
  console.log('Grid State changed:: ', gridStateChanges);
  console.log('Grid State changed:: ', gridStateChanges.change);
}

function toggleSubTitle() {
  showSubTitle.value = !showSubTitle.value;
  const action = showSubTitle.value ? 'remove' : 'add';
  document.querySelector('.subtitle')?.classList[action]('hidden');
  queueMicrotask(() => vueGrid.resizerService.resizeGrid());
}

function vueGridReady(grid: SlickgridVueInstance) {
  vueGrid = grid;
}
</script>

<template>
  <h2>
     Example 2: Localization with Locales - French Locale displayed
    <span class="float-end">
      <a
        style="font-size: 18px"
        target="_blank"
        href="https://github.com/ghiscoding/slickgrid-vue-demos/tree/main/single-locale-without-i18n/src/examples/slickgrid/Example02.vue"
      >
        <span class="mdi mdi-link-variant"></span> code
      </a>
    </span>
    <button class="ms-2 btn btn-outline-secondary btn-sm btn-icon" type="button" data-test="toggle-subtitle" @click="toggleSubTitle()">
      <span class="mdi mdi-information-outline" title="Toggle example sub-title details"></span>
    </button>
  </h2>

  <div class="subtitle">
    This Examples uses French Locales but you could use your own custom locales
    <ul>
      <li>Defining your own Custom Locales must include all necessary text, see the docs (<a href="https://ghiscoding.gitbook.io/slickgrid-vue/localization/localization-with-custom-locales" target="_blank">with Custom Locales</a>)</li>
    </ul>
  </div>

  <hr />

  <div class="row">
    <div class="col-sm-12">
      <span style="margin-left: 20px">
        <button class="btn btn-outline-secondary btn-sm btn-icon" @click="exportToFile('csv')">
          <i class="mdi mdi-download"></i>
          Download to CSV
        </button>
        <button class="btn btn-outline-secondary btn-sm btn-icon mx-1" @click="exportToFile('txt')">
          <i class="mdi mdi-download"></i>
          Download to Text
        </button>
        <button class="btn btn-outline-secondary btn-sm btn-icon" @click="exportToExcel()">
          <i class="mdi mdi-file-excel-outline text-success"></i>
          Download to Excel
        </button>
      </span>
      <span style="margin-left: 10px">
        <button class="btn btn-outline-secondary btn-sm btn-icon" @click="dynamicallyAddTitleHeader()">
          <i class="mdi mdi-shape-square-plus"></i>
          Dynamically Duplicate Title Column
        </button>
      </span>
    </div>
  </div>

  <slickgrid-vue
    v-model:options="gridOptions"
    v-model:columns="columnDefinitions"
    v-model:data="dataset"
    grid-id="grid2"
    @onGridStateChanged="gridStateChanged($event.detail)"
    @onVueGridCreated="vueGridReady($event.detail)"
  >
  </slickgrid-vue>
</template>
