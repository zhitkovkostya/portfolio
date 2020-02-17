export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
        name: 'slug',
        title: 'Slug',
        type: 'slug',
        options: {
            source: 'title',
            maxLength: 96
        }
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string'
    },
    {
      name: 'description',
      title: 'Description',
      type: 'blockContent'
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{type: 'image'}]
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: {type: 'category'}}]
    }
  ],

  preview: {
    select: {
      title: 'title',
      media: 'mainImage'
    },
    prepare(selection) {
      const {author} = selection;

      return Object.assign({}, selection, {
        subtitle: author && `by ${author}`
      })
    }
  }
}
