local telescope = require('telescope')
local builtins = require('telescope.builtin')

telescope.setup({
		defaults = {
			prompt_prefix = ' ',
		},
		pickers = {
			find_files = {
      find_command = {'rg', '--files', '--hidden', '-g', '!.git'},
    },
    buffers = {
      show_all_buffers = true
    }
	}
	})

-- Define some mappings
-- TODO: describe leader key
-- TODO: describe mappings
vim.keymap.set('n', '<leader><leader>', builtins.find_files)
vim.keymap.set('n', '<leader>/', builtins.live_grep)
vim.keymap.set('n', '<leader><bs>', builtins.buffers)
vim.keymap.set('n', '<leader>f.', builtins.resume)
