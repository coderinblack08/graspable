import { render } from '@redwoodjs/testing/web'

import BasicLayout from './BasicLayout'

//   Improve this test with help from the Redwood Testing Doc:
//   https://redwoodjs.com/docs/testing#testing-pages-layouts

describe('BasicLayout', () => {
  it('renders successfully', () => {
    expect(() => {
      render(<BasicLayout />)
    }).not.toThrow()
  })
})
