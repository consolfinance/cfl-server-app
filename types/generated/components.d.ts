import type { Schema, Struct } from '@strapi/strapi';

export interface FilesSupportingDocument extends Struct.ComponentSchema {
  collectionName: 'components_files_supporting_documents';
  info: {
    displayName: 'Supporting Document';
    icon: 'file';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    fileKey: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'files.supporting-document': FilesSupportingDocument;
    }
  }
}
