import { NgModule } from '@angular/core';

import { FeatherModule } from 'angular-feather';
import { Check, DownloadCloud, Edit3, Clock, Trash2, Folder, User, Search, Settings, MoreVertical, Save, Menu, FileText, ChevronUp, ChevronDown, Plus, FilePlus, X, Anchor, ChevronLeft } from 'angular-feather/icons';

// Select some icons (use an object, not an array)
const icons = {
  DownloadCloud,
  Edit3,
  Clock,
  Trash2,
  Folder,
  User,
  Search,
  Settings,
  MoreVertical,
  Save,
  Menu,
  FileText,
  ChevronUp,
  ChevronDown,
  Plus,
  FilePlus,
  X,
  Anchor,
  ChevronLeft,
  Check,
};

@NgModule({
  imports: [
    FeatherModule.pick(icons),
  ],
  exports: [
    FeatherModule,
  ],
})
export class IconsModule { }
